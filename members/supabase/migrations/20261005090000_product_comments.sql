-- Comments on product pages. Only members with access to the product write them; an administrator approves
-- each one before other members see it. Only the server reads and writes the table (service role), after
-- checking the member's access, so members never query it directly.

create type public.comment_status as enum ('pending', 'approved', 'rejected');

create table public.product_comments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1500),
  status public.comment_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  constraint product_comments_reviewed check (status = 'pending' or reviewed_at is not null)
);
create index product_comments_product_idx on public.product_comments (product_id, created_at desc);
create index product_comments_pending_idx on public.product_comments (created_at) where status = 'pending';
create index product_comments_user_idx on public.product_comments (user_id);
create index product_comments_reviewed_by_idx on public.product_comments (reviewed_by);

alter table public.product_comments enable row level security;
-- No policies on purpose.
revoke all on public.product_comments from anon, authenticated;
