begin;

-- Estas funciones consultan relaciones familiares y solo deben ejecutarse
-- dentro de una sesión autenticada; las políticas RLS conservan su acceso.
revoke all on function public.is_family_member(uuid) from public;
revoke all on function public.is_family_member(uuid) from anon;
revoke all on function public.is_family_admin(uuid) from public;
revoke all on function public.is_family_admin(uuid) from anon;
revoke all on function public.get_family_members(uuid) from public;
revoke all on function public.get_family_members(uuid) from anon;

grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.is_family_admin(uuid) to authenticated;
grant execute on function public.get_family_members(uuid) to authenticated;

commit;
