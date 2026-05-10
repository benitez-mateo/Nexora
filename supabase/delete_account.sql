-- =============================================================================
-- Nexora · Función para que cada usuario borre su propia cuenta
-- =============================================================================
-- Supabase no expone la eliminación de usuarios al cliente por seguridad
-- (requiere la service_role key). Esta función con `security definer` permite
-- que un usuario autenticado se elimine *solo a sí mismo* sin necesidad de
-- exponer claves privilegiadas.
--
-- Ejecuta este script una sola vez en Supabase → SQL Editor → New query.
-- =============================================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'No hay sesión activa';
  end if;

  -- Borrar el usuario de auth.users dispara el cascade hacia public.profiles
  -- (por la FK de profiles.id) y deja proyectos con created_by = null.
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

comment on function public.delete_my_account() is
  'Elimina la cuenta del usuario autenticado. Solo afecta a su propio registro.';
