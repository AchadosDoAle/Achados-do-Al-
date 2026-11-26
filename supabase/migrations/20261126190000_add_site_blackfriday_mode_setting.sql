create unique index if not exists integrations_site_setting_unique
  on public.integrations (tipo, nome)
  where tipo = 'site_setting';

insert into public.integrations (tipo, nome, ativo)
values ('site_setting', 'blackfriday_mode', false)
on conflict (tipo, nome) where tipo = 'site_setting'
do nothing;

drop policy if exists "Leitura publica do modo Black Friday" on public.integrations;
create policy "Leitura publica do modo Black Friday"
  on public.integrations
  for select
  to anon, authenticated
  using (tipo = 'site_setting' and nome = 'blackfriday_mode');
