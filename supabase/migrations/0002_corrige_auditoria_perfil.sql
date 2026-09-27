-- Corrige a auditoria de perfil: `text[] || 'literal'` era interpretado como
-- concatenação de dois arrays e falhava ("malformed array literal").
create or replace function public.audit_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed text[] := '{}';
begin
  if new.first_name is distinct from old.first_name then changed := array_append(changed, 'first_name'); end if;
  if new.last_name is distinct from old.last_name then changed := array_append(changed, 'last_name'); end if;
  if new.birth_date is distinct from old.birth_date then changed := array_append(changed, 'birth_date'); end if;
  if new.biological_sex is distinct from old.biological_sex then changed := array_append(changed, 'biological_sex'); end if;
  if new.onboarding_completed_at is distinct from old.onboarding_completed_at then changed := array_append(changed, 'onboarding_completed_at'); end if;

  if cardinality(changed) > 0 then
    insert into public.audit_log (user_id, action, detail)
    values (new.id, 'profile.updated', jsonb_build_object('fields', to_jsonb(changed)));
  end if;
  return new;
end;
$$;

revoke execute on function public.audit_profile_update() from anon, authenticated, public;
