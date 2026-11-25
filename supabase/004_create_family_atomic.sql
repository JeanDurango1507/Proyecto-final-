begin;

-- Crea el grupo y asigna a su administrador en una sola transacción.
create or replace function public.create_family(group_name text)
returns table(id uuid, name text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_family_id uuid;
  normalized_name text := trim(group_name);
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión para crear un grupo familiar.';
  end if;

  if char_length(normalized_name) not between 2 and 100 then
    raise exception 'El nombre del grupo debe tener entre 2 y 100 caracteres.';
  end if;

  insert into public.families as inserted_family (name)
  values (normalized_name)
  returning inserted_family.id into created_family_id;

  insert into public.family_members (family_id, user_id, role)
  values (created_family_id, auth.uid(), 'admin');

  return query
    select f.id, f.name
    from public.families as f
    where f.id = created_family_id;
end;
$$;

revoke all on function public.create_family(text) from public;
revoke all on function public.create_family(text) from anon;
grant execute on function public.create_family(text) to authenticated;

commit;
