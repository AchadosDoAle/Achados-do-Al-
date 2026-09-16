-- Rode isto no SQL Editor do Supabase (igual fizemos com o schema.sql)
-- Cria um espaço público de armazenamento para as imagens das ofertas.

insert into storage.buckets (id, name, public)
values ('ofertas', 'ofertas', true)
on conflict (id) do nothing;

create policy "Qualquer um pode ver as imagens das ofertas"
  on storage.objects for select
  using (bucket_id = 'ofertas');

create policy "Usuários autenticados podem enviar imagens"
  on storage.objects for insert
  with check (bucket_id = 'ofertas' and auth.role() = 'authenticated');

create policy "Usuários autenticados podem substituir imagens"
  on storage.objects for update
  using (bucket_id = 'ofertas' and auth.role() = 'authenticated');

create policy "Usuários autenticados podem excluir imagens"
  on storage.objects for delete
  using (bucket_id = 'ofertas' and auth.role() = 'authenticated');
