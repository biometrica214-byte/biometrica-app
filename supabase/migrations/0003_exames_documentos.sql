-- =====================================================================
-- Biométrica — Bloco 2: exames e documentos originais.
--
-- Camadas (cada uma na sua tabela, para o Bloco 3 em diante):
--   exams            → o "evento" de exame (o que, quando, onde)
--   exam_documents   → arquivos originais, imutáveis (fonte primária)
--   [Bloco 3]        → texto extraído, biomarcadores, resultados...
--
-- Arquivos ficam no bucket privado "exam-documents", no caminho
--   {user_id}/{exam_id}/{document_id}.{ext}
-- e só o dono acessa (RLS nas tabelas + políticas no storage).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Categorias de exame: tabela (não enum) para crescer sem migração de tipo.
-- ---------------------------------------------------------------------
create table public.exam_categories (
  slug       text primary key check (slug ~ '^[a-z][a-z0-9_]{1,40}$'),
  label      text not null,
  sort_order int not null default 100,
  is_active  boolean not null default true
);

insert into public.exam_categories (slug, label, sort_order) values
  ('laboratory', 'Exames laboratoriais', 10),
  ('imaging',    'Exames de imagem',     20),
  ('checkup',    'Check-up',             30),
  ('other',      'Outro',                90);

-- Estados de processamento. No Bloco 2 só "uploaded" (Recebido) e "error"
-- são usados; os demais existem para o Bloco 3.
create type public.exam_status as enum ('uploaded', 'processing', 'processed', 'review_required', 'error');

-- ---------------------------------------------------------------------
-- Exames
-- ---------------------------------------------------------------------
create table public.exams (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null check (char_length(trim(title)) between 1 and 120),
  category     text not null default 'other' references public.exam_categories (slug),
  collected_on date not null check (collected_on >= date '1900-01-01'), -- data da coleta (histórico)
  laboratory   text check (laboratory is null or char_length(laboratory) between 1 and 120),
  notes        text check (notes is null or char_length(notes) <= 2000),
  status       public.exam_status not null default 'uploaded',
  created_at   timestamptz not null default now(),                      -- data do envio
  updated_at   timestamptz not null default now(),
  unique (id, user_id) -- alvo da FK composta dos documentos
);

create index exams_user_collected_idx on public.exams (user_id, collected_on desc, created_at desc);

create trigger exams_set_updated_at
  before update on public.exams
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Documentos originais (um exame pode ter vários)
-- user_id é repetido de propósito: a FK composta garante que é o mesmo
-- dono do exame, e permite políticas simples no storage e no RLS.
-- ---------------------------------------------------------------------
create table public.exam_documents (
  id                uuid primary key default gen_random_uuid(),
  exam_id           uuid not null,
  user_id           uuid not null,
  original_filename text not null check (char_length(original_filename) between 1 and 255),
  mime_type         text not null check (mime_type in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')),
  size_bytes        bigint not null check (size_bytes > 0 and size_bytes <= 20971520),
  storage_path      text not null unique,
  created_at        timestamptz not null default now(),
  foreign key (exam_id, user_id) references public.exams (id, user_id) on delete cascade,
  check (storage_path like user_id::text || '/' || exam_id::text || '/%')
);

create index exam_documents_exam_idx on public.exam_documents (exam_id, created_at);

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.exam_categories enable row level security;
alter table public.exams           enable row level security;
alter table public.exam_documents  enable row level security;

create policy "exam_categories: leitura autenticada"
  on public.exam_categories for select to authenticated using (true);

create policy "exams: ler os próprios"
  on public.exams for select to authenticated
  using (user_id = (select auth.uid()));
create policy "exams: criar para si"
  on public.exams for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "exams: editar os próprios"
  on public.exams for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "exams: excluir os próprios"
  on public.exams for delete to authenticated
  using (user_id = (select auth.uid()));

-- Documentos: ler, criar e excluir; nunca editar (o original é imutável).
create policy "exam_documents: ler os próprios"
  on public.exam_documents for select to authenticated
  using (user_id = (select auth.uid()));
create policy "exam_documents: criar para si"
  on public.exam_documents for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "exam_documents: excluir os próprios"
  on public.exam_documents for delete to authenticated
  using (user_id = (select auth.uid()));

-- Privilégios: o cliente só altera o que faz sentido alterar.
revoke all on public.exam_categories, public.exams, public.exam_documents from anon;
revoke insert, update, delete, truncate on public.exam_categories, public.exams, public.exam_documents from authenticated;
grant select on public.exam_categories, public.exams, public.exam_documents to authenticated;
grant insert (id, user_id, title, category, collected_on, laboratory, notes) on public.exams to authenticated;
grant update (title, category, collected_on, laboratory, notes) on public.exams to authenticated;
grant delete on public.exams to authenticated;
grant insert (id, exam_id, user_id, original_filename, mime_type, size_bytes, storage_path) on public.exam_documents to authenticated;
grant delete on public.exam_documents to authenticated;
-- status não é editável pelo cliente: será controlado pelo processamento (Bloco 3).

-- ---------------------------------------------------------------------
-- Criação atômica: exame + documentos numa única transação.
-- security invoker → as políticas acima continuam valendo.
-- A auditoria é feita pelo gatilho exams_audit (abaixo).
-- ---------------------------------------------------------------------
create or replace function public.create_exam_with_documents(
  p_exam_id      uuid,
  p_title        text,
  p_category     text,
  p_collected_on date,
  p_laboratory   text,
  p_notes        text,
  p_documents    jsonb -- [{ id, original_filename, mime_type, size_bytes, storage_path }]
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if jsonb_typeof(p_documents) <> 'array' or jsonb_array_length(p_documents) not between 1 and 10 then
    raise exception 'invalid documents' using errcode = '22023';
  end if;

  insert into public.exams (id, user_id, title, category, collected_on, laboratory, notes)
  values (p_exam_id, v_user, trim(p_title), p_category, p_collected_on,
          nullif(trim(p_laboratory), ''), nullif(trim(p_notes), ''));

  insert into public.exam_documents (id, exam_id, user_id, original_filename, mime_type, size_bytes, storage_path)
  select (d ->> 'id')::uuid, p_exam_id, v_user, d ->> 'original_filename', d ->> 'mime_type',
         (d ->> 'size_bytes')::bigint, d ->> 'storage_path'
  from jsonb_array_elements(p_documents) d;

  return p_exam_id;
end;
$$;

revoke execute on function public.create_exam_with_documents(uuid, text, text, date, text, text, jsonb) from anon, public;
grant execute on function public.create_exam_with_documents(uuid, text, text, date, text, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- Auditoria (sem conteúdo sensível: só ids e nomes de campos)
-- ---------------------------------------------------------------------
create or replace function public.audit_exam()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed text[] := '{}';
begin
  if tg_op = 'INSERT' then
    insert into public.audit_log (user_id, action, detail)
    values (new.user_id, 'exam.created', jsonb_build_object('exam_id', new.id));
    return new;
  elsif tg_op = 'UPDATE' then
    if new.title is distinct from old.title then changed := array_append(changed, 'title'); end if;
    if new.category is distinct from old.category then changed := array_append(changed, 'category'); end if;
    if new.collected_on is distinct from old.collected_on then changed := array_append(changed, 'collected_on'); end if;
    if new.laboratory is distinct from old.laboratory then changed := array_append(changed, 'laboratory'); end if;
    if new.notes is distinct from old.notes then changed := array_append(changed, 'notes'); end if;
    if new.status is distinct from old.status then changed := array_append(changed, 'status'); end if;
    if cardinality(changed) > 0 then
      insert into public.audit_log (user_id, action, detail)
      values (new.user_id, 'exam.updated', jsonb_build_object('exam_id', new.id, 'fields', to_jsonb(changed)));
    end if;
    return new;
  else
    -- Na exclusão da conta (cascata a partir de auth.users) o usuário já não
    -- existe: não registramos, para não violar a FK do audit_log.
    if exists (select 1 from auth.users u where u.id = old.user_id) then
      insert into public.audit_log (user_id, action, detail)
      values (old.user_id, 'exam.deleted', jsonb_build_object('exam_id', old.id));
    end if;
    return old;
  end if;
end;
$$;

create trigger exams_audit
  after insert or update or delete on public.exams
  for each row execute function public.audit_exam();

revoke execute on function public.audit_exam() from anon, authenticated, public;

-- ---------------------------------------------------------------------
-- Storage: bucket privado, com limites aplicados pelo próprio Supabase.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('exam-documents', 'exam-documents', false, 20971520,
        array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

-- O primeiro segmento do caminho é sempre o id do dono.
create policy "exam-documents: ler os próprios"
  on storage.objects for select to authenticated
  using (bucket_id = 'exam-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "exam-documents: enviar para a própria pasta"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'exam-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "exam-documents: excluir os próprios"
  on storage.objects for delete to authenticated
  using (bucket_id = 'exam-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Sem política de UPDATE: um arquivo enviado nunca é sobrescrito.
