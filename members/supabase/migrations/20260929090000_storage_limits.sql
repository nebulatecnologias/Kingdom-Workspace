-- Phase 6: the private "products" bucket enforces what the admin upload form already checks.
-- Uploads use one-time signed URLs issued by the server; these limits make Storage itself refuse
-- anything else (other file types, or files over 50 MB), whatever the browser sends.
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    update storage.buckets
    set file_size_limit = 52428800,
        allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/epub+zip']
    where id = 'products';
  end if;
end;
$$;
