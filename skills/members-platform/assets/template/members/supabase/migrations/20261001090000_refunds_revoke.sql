-- Decision: any refund, full or partial, removes the access that order gave. A partially refunded order
-- no longer grants on a late order.paid, and a dispute won on a partially refunded order does not give
-- the access back. Open disputes still suspend access (DISPUTE_SUSPENDS_ACCESS) and a won dispute restores it.

create or replace function public.gateway_apply_event(p_type text, p_data jsonb, p_suspend_on_dispute boolean default true)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_order jsonb := coalesce(p_data -> 'order', '{}'::jsonb);
  v_gid text := nullif(trim(v_order ->> 'id'), '');
  v_email text := lower(nullif(trim(p_data -> 'customer' ->> 'email'), ''));
  v_name text := coalesce(p_data -> 'customer' ->> 'name', '');
  v_locale public.locale := case p_data ->> 'locale' when 'pt' then 'pt'::public.locale when 'es' then 'es'::public.locale else 'en'::public.locale end;
  v_amount int := coalesce((v_order ->> 'amount')::int, 0);
  v_refunded int := coalesce((v_order ->> 'refunded_amount')::int, (p_data ->> 'refunded_amount')::int, 0);
  v_member uuid;
  v_user uuid;
  v_target_email text;
  v_order_id uuid;
  v_prev public.order_status;
  v_status public.order_status;
  v_full boolean;
  v_outcome text;
  v_products uuid[] := '{}';
  v_unmapped text[] := '{}';
  v_granted uuid[] := '{}';
  v_revoked int := 0;
  v_restored int := 0;
begin
  if v_gid is null or v_email is null then
    raise exception 'data.order.id and data.customer.email are required' using errcode = '22023';
  end if;

  -- Whose library: the member who clicked the padlock (metadata.member_user_id), else the account with the checkout email.
  begin
    v_member := nullif(p_data -> 'metadata' ->> 'member_user_id', '')::uuid;
  exception when invalid_text_representation then
    v_member := null;
  end;
  if v_member is not null then
    select id, email into v_user, v_target_email from public.profiles where id = v_member;
  end if;
  if v_user is null then
    select id, email into v_user, v_target_email from public.profiles where email = v_email;
  end if;
  v_target_email := coalesce(v_target_email, v_email);

  select id, status into v_order_id, v_prev from public.orders where gateway_order_id = v_gid for update;

  -- Status each event moves the order to. Terminal states (refunded, dispute_lost) are never undone.
  if p_type = 'order.paid' then
    v_status := case when v_prev in ('refunded', 'dispute_lost', 'disputed', 'partially_refunded') then v_prev else 'paid' end;
  elsif p_type = 'order.refunded' then
    v_full := coalesce((v_order ->> 'full_refund')::boolean, (p_data ->> 'full_refund')::boolean, v_amount > 0 and v_refunded >= v_amount);
    v_status := case when v_prev = 'dispute_lost' then v_prev when v_full then 'refunded' else 'partially_refunded' end;
  elsif p_type = 'order.disputed' then
    v_status := case when v_prev in ('refunded', 'dispute_lost') then v_prev else 'disputed' end;
  elsif p_type = 'order.dispute_resolved' then
    v_outcome := coalesce(p_data ->> 'outcome', p_data -> 'dispute' ->> 'outcome', v_order ->> 'dispute_outcome');
    if v_outcome is null or v_outcome not in ('won', 'lost') then
      raise exception 'order.dispute_resolved needs outcome won or lost' using errcode = '22023';
    end if;
    -- A won dispute never undoes a refund, including one recorded before the dispute.
    v_status := case
      when v_prev in ('refunded', 'partially_refunded') then v_prev
      when v_outcome = 'lost' then 'dispute_lost'
      when v_refunded > 0 or exists (select 1 from public.orders o where o.id = v_order_id and o.refunded_cents > 0) then 'partially_refunded'
      else 'paid' end;
  else
    raise exception 'unsupported event type %', p_type using errcode = '22023';
  end if;

  if v_order_id is null then
    insert into public.orders (gateway_order_id, reference, email, user_id, amount_cents, currency, refunded_cents, status, locale, raw)
    values (v_gid, v_order ->> 'reference', v_email, v_user, v_amount, coalesce(v_order ->> 'currency', 'ZAR'), v_refunded, v_status, v_locale, p_data)
    returning id into v_order_id;
  else
    update public.orders set
      reference = coalesce(v_order ->> 'reference', reference),
      user_id = coalesce(user_id, v_user),
      amount_cents = case when v_amount > 0 then v_amount else amount_cents end,
      refunded_cents = greatest(refunded_cents, v_refunded),
      status = v_status,
      raw = p_data
    where id = v_order_id;
  end if;

  if p_type = 'order.paid' then
    select coalesce(array_agg(distinct p.id), '{}') into v_products
    from jsonb_array_elements(coalesce(p_data -> 'items', '[]'::jsonb)) i
    join public.products p on p.gateway_product_id = i ->> 'product_id';

    select coalesce(array_agg(distinct i ->> 'product_id'), '{}') into v_unmapped
    from jsonb_array_elements(coalesce(p_data -> 'items', '[]'::jsonb)) i
    where not exists (select 1 from public.products p where p.gateway_product_id = i ->> 'product_id');

    if v_status = 'paid' then
      with ins as (
        insert into public.entitlements (user_id, email, product_id, source, order_id)
        select v_user, v_target_email, pid, 'order', v_order_id from unnest(v_products) as pid
        on conflict (email, product_id) where revoked_at is null do nothing
        returning product_id
      )
      select coalesce(array_agg(product_id), '{}') into v_granted from ins;
    end if;

  elsif p_type = 'order.refunded' and v_status in ('refunded', 'partially_refunded') then
    update public.entitlements set revoked_at = now(), revoked_reason = 'refund'
    where order_id = v_order_id and revoked_at is null;
    get diagnostics v_revoked = row_count;

  elsif p_type = 'order.disputed' and p_suspend_on_dispute and v_status = 'disputed' then
    update public.entitlements set revoked_at = now(), revoked_reason = 'dispute'
    where order_id = v_order_id and revoked_at is null;
    get diagnostics v_revoked = row_count;

  elsif p_type = 'order.dispute_resolved' and v_status = 'dispute_lost' then
    update public.entitlements set revoked_at = coalesce(revoked_at, now()), revoked_reason = 'dispute_lost'
    where order_id = v_order_id and (revoked_at is null or revoked_reason = 'dispute');
    get diagnostics v_revoked = row_count;

  elsif p_type = 'order.dispute_resolved' and v_status = 'paid' then
    -- Give back what the dispute suspended, unless the person has meanwhile got the product another way.
    update public.entitlements e set revoked_at = null, revoked_reason = null
    where e.order_id = v_order_id and e.revoked_reason = 'dispute'
      and not exists (
        select 1 from public.entitlements x
        where x.email = e.email and x.product_id = e.product_id and x.revoked_at is null
      );
    get diagnostics v_restored = row_count;
  end if;

  insert into public.audit_log (actor_id, action, target_type, target_id, meta)
  values (null, 'gateway.' || p_type, 'order', v_order_id::text, jsonb_build_object(
    'gateway_order_id', v_gid, 'status', v_status, 'granted', to_jsonb(v_granted),
    'unmapped', to_jsonb(v_unmapped), 'revoked', v_revoked, 'restored', v_restored));

  return jsonb_build_object(
    'order_id', v_order_id,
    'status', v_status,
    'user_id', v_user,
    'email', v_target_email,
    'checkout_email', v_email,
    'name', v_name,
    'locale', v_locale,
    'products', to_jsonb(v_products),
    'granted', to_jsonb(v_granted),
    'unmapped', to_jsonb(v_unmapped),
    'revoked', v_revoked,
    'restored', v_restored
  );
end;
$$;
