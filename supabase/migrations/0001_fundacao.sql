-- =====================================================================
-- Biométrica — Bloco 1: fundação (perfis, configurações, consentimentos,
-- documentos legais versionados e trilha de auditoria).
--
-- Princípios:
--   * Todo dado pertence a um usuário e só ele o acessa (RLS em tudo).
--   * Consentimentos são um registro somente-inclusão: conceder e revogar
--     geram novas linhas; nada é editado ou apagado pelo usuário.
--   * Coleta mínima: só guardamos o que o produto usa.
--
-- Os próximos blocos (exames, documentos, biomarcadores, resultados)
-- seguem o mesmo padrão: user_id -> auth.users + RLS por auth.uid().
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.legal_document_type as enum ('terms', 'privacy', 'health_data', 'marketing');

-- Sexo biológico: usado apenas para escolher faixas de referência
-- laboratoriais, que variam por sexo. Opcional.
create type public.biological_sex as enum ('female', 'male');

-- ---------------------------------------------------------------------
-- Utilitário: updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Documentos legais versionados
-- Cada nova versão de um documento é uma nova linha; apenas uma por tipo
-- fica marcada como vigente (is_current). Consentimentos apontam para a
-- versão exata que o usuário aceitou.
-- ---------------------------------------------------------------------
create table public.legal_documents (
  id             uuid primary key default gen_random_uuid(),
  type           public.legal_document_type not null,
  version        text not null,
  title          text not null,
  path           text not null,                 -- rota pública onde o texto está
  required       boolean not null,              -- obrigatório para usar o produto?
  is_placeholder boolean not null default true, -- texto jurídico ainda não definitivo
  is_current     boolean not null default false,
  effective_at   timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  unique (type, version)
);

create unique index legal_documents_one_current_per_type
  on public.legal_documents (type) where is_current;

-- ---------------------------------------------------------------------
-- Perfis (1:1 com auth.users). O e-mail fica só em auth.users.
-- ---------------------------------------------------------------------
create table public.profiles (
  id                      uuid primary key references auth.users (id) on delete cascade,
  first_name              text not null default '' check (char_length(first_name) <= 80),
  last_name               text not null default '' check (char_length(last_name) <= 80),
  birth_date              date check (birth_date >= date '1900-01-01'),
  biological_sex          public.biological_sex,
  onboarding_completed_at timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Configurações do usuário (preferências de interface por enquanto)
-- ---------------------------------------------------------------------
create table public.user_settings (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  theme      text not null default 'system' check (theme in ('system', 'light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Consentimentos (somente inclusão)
-- A decisão vigente de um usuário para um documento é a linha mais
-- recente; revogar = inserir granted = false.
-- ---------------------------------------------------------------------
create table public.consents (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  document_id uuid not null references public.legal_documents (id),
  granted     boolean not null,
  source      text not null default 'app' check (source in ('signup', 'app')),
  created_at  timestamptz not null default now()
);

create index consents_user_document_idx
  on public.consents (user_id, document_id, created_at desc);

-- ---------------------------------------------------------------------
-- Trilha de auditoria: escrita apenas por gatilhos (security definer).
-- Registra QUAIS campos mudaram, nunca os valores.
-- ---------------------------------------------------------------------
create table public.audit_log (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users (id) on delete set null,
  action     text not null,
  detail     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_user_idx on public.audit_log (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.legal_documents enable row level security;
alter table public.profiles        enable row level security;
alter table public.user_settings   enable row level security;
alter table public.consents        enable row level security;
alter table public.audit_log       enable row level security;

-- Documentos legais: leitura pública (a página de cadastro precisa deles).
create policy "legal_documents: leitura pública"
  on public.legal_documents for select
  to anon, authenticated
  using (true);

-- Perfis: cada usuário lê e edita apenas o próprio.
create policy "profiles: ler o próprio"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles: editar o próprio"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Configurações: idem.
create policy "user_settings: ler as próprias"
  on public.user_settings for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "user_settings: editar as próprias"
  on public.user_settings for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Consentimentos: ler os próprios; incluir apenas para si, apenas para
-- versões vigentes. Sem update/delete: o histórico é imutável.
create policy "consents: ler os próprios"
  on public.consents for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "consents: registrar os próprios"
  on public.consents for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and source = 'app'
    and exists (
      select 1 from public.legal_documents d
      where d.id = document_id and d.is_current
    )
  );

-- audit_log: sem políticas = ninguém acessa pela API.

-- ---------------------------------------------------------------------
-- Privilégios de coluna: o cliente só pode alterar campos editáveis.
-- ---------------------------------------------------------------------
revoke all on public.profiles, public.user_settings, public.consents, public.audit_log, public.legal_documents from anon;
revoke insert, update, delete, truncate on public.profiles, public.user_settings, public.consents, public.audit_log, public.legal_documents from authenticated;

grant select on public.legal_documents to anon, authenticated;
grant select on public.profiles, public.user_settings, public.consents to authenticated;
grant update (first_name, last_name, birth_date, biological_sex, onboarding_completed_at) on public.profiles to authenticated;
grant update (theme) on public.user_settings to authenticated;
grant insert (document_id, granted, source, user_id) on public.consents to authenticated;

-- ---------------------------------------------------------------------
-- Estado atual dos consentimentos do usuário logado, por documento vigente.
-- ---------------------------------------------------------------------
create or replace function public.consent_status()
returns table (
  document_id    uuid,
  type           public.legal_document_type,
  title          text,
  version        text,
  path           text,
  required       boolean,
  is_placeholder boolean,
  granted        boolean,
  decided_at     timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select d.id, d.type, d.title, d.version, d.path, d.required, d.is_placeholder,
         coalesce(c.granted, false), c.created_at
  from public.legal_documents d
  left join lateral (
    select c.granted, c.created_at
    from public.consents c
    where c.document_id = d.id
      and c.user_id = (select auth.uid())
    order by c.created_at desc, c.id desc
    limit 1
  ) c on true
  where d.is_current
  order by d.type;
$$;

revoke execute on function public.consent_status() from anon, public;
grant execute on function public.consent_status() to authenticated;

-- ---------------------------------------------------------------------
-- Novo usuário: cria perfil, configurações e registra os consentimentos
-- dados no cadastro. Os metadados trazem { consents: { tipo: versão } }
-- e só são aceitos se a versão for exatamente a vigente.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    left(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), 80),
    left(trim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), 80)
  );

  insert into public.user_settings (user_id) values (new.id);

  insert into public.consents (user_id, document_id, granted, source)
  select new.id, d.id, true, 'signup'
  from public.legal_documents d
  where d.is_current
    and d.version = (new.raw_user_meta_data -> 'consents' ->> d.type::text);

  insert into public.audit_log (user_id, action) values (new.id, 'account.created');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Auditoria automática
-- ---------------------------------------------------------------------
create or replace function public.audit_consent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_log (user_id, action, detail)
  select new.user_id,
         case when new.granted then 'consent.granted' else 'consent.revoked' end,
         jsonb_build_object('type', d.type, 'version', d.version, 'source', new.source)
  from public.legal_documents d
  where d.id = new.document_id;
  return new;
end;
$$;

create trigger consents_audit
  after insert on public.consents
  for each row execute function public.audit_consent();

create or replace function public.audit_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed text[] := '{}';
begin
  if new.first_name is distinct from old.first_name then changed := changed || 'first_name'; end if;
  if new.last_name is distinct from old.last_name then changed := changed || 'last_name'; end if;
  if new.birth_date is distinct from old.birth_date then changed := changed || 'birth_date'; end if;
  if new.biological_sex is distinct from old.biological_sex then changed := changed || 'biological_sex'; end if;
  if new.onboarding_completed_at is distinct from old.onboarding_completed_at then changed := changed || 'onboarding_completed_at'; end if;

  if array_length(changed, 1) > 0 then
    insert into public.audit_log (user_id, action, detail)
    values (new.id, 'profile.updated', jsonb_build_object('fields', to_jsonb(changed)));
  end if;
  return new;
end;
$$;

create trigger profiles_audit
  after update on public.profiles
  for each row execute function public.audit_profile_update();

-- As funções de gatilho não devem ser chamáveis pela API.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.audit_consent() from anon, authenticated, public;
revoke execute on function public.audit_profile_update() from anon, authenticated, public;

-- ---------------------------------------------------------------------
-- Versões iniciais (rascunho) dos documentos legais.
-- Substituir pelos textos definitivos antes do lançamento.
-- ---------------------------------------------------------------------
insert into public.legal_documents (type, version, title, path, required, is_placeholder, is_current) values
  ('terms',       '0.1-rascunho', 'Termos de Uso',                                   '/termos',                        true,  true, true),
  ('privacy',     '0.1-rascunho', 'Política de Privacidade',                         '/privacidade',                   true,  true, true),
  ('health_data', '0.1-rascunho', 'Consentimento para tratamento de dados de saúde', '/privacidade#dados-de-saude',    true,  true, true),
  ('marketing',   '0.1-rascunho', 'Comunicações sobre novidades da Biométrica',      '/privacidade#comunicacoes',      false, true, true);
