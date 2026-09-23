-- Criar bucket para capas de disciplinas (imagens Stories 9:16)
-- Executar no Supabase SQL Editor ou via Supabase CLI

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'capas',
  'capas',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Policy: leitura pública
create policy "Leitura pública de capas"
  on storage.objects for select
  using ( bucket_id = 'capas' );

-- Policy: upload via service role (server actions)
create policy "Upload de capas via service role"
  on storage.objects for insert
  with check ( bucket_id = 'capas' );

-- Policy: upsert via service role
create policy "Upsert de capas via service role"
  on storage.objects for update
  using ( bucket_id = 'capas' );
