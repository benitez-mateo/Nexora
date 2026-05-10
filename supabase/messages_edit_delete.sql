-- =============================================================================
-- Nexora · Migración: editar y eliminar mensajes (estilo WhatsApp)
-- =============================================================================
-- Añade columnas para tracking de edición y borrado, y endurece las RLS
-- para que cada usuario solo pueda modificar sus propios mensajes.
--
-- Ejecuta este script una sola vez en Supabase → SQL Editor → New query.
-- Es idempotente.
-- =============================================================================

-- 1. Columnas nuevas ---------------------------------------------------------
alter table public.messages
  add column if not exists user_id    uuid references auth.users(id) on delete set null,
  add column if not exists edited_at  timestamptz,
  add column if not exists deleted_at timestamptz;

comment on column public.messages.user_id    is 'Autor del mensaje. Permite RLS por dueño.';
comment on column public.messages.edited_at  is 'Timestamp del último edit. Null si no se editó.';
comment on column public.messages.deleted_at is 'Soft-delete: timestamp de eliminación. Null si está activo.';

-- 2. Backfill: a los mensajes viejos sin user_id intentamos asignarles uno
--    via match por nombre con auth.users.raw_user_meta_data->>'name'.
--    No hace falta ejecutar siempre; solo aporta cuando hay datos legacy.
update public.messages m
set user_id = u.id
from auth.users u
where m.user_id is null
  and m.who = coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1));

-- 3. RLS endurecidas ---------------------------------------------------------
-- Borramos la policy "todo permitido" anterior y la partimos por operación.
drop policy if exists "messages_all_authenticated" on public.messages;
drop policy if exists "messages_select"            on public.messages;
drop policy if exists "messages_insert"            on public.messages;
drop policy if exists "messages_update_own"        on public.messages;
drop policy if exists "messages_delete_own"        on public.messages;

-- Cualquier autenticado puede leer.
create policy "messages_select"
  on public.messages
  for select
  using (auth.role() = 'authenticated');

-- Cualquier autenticado puede insertar mensajes propios (user_id = auth.uid()).
-- Si insertan sin user_id (clientes viejos), también dejamos pasar para no
-- romper compatibilidad — pero el cliente nuevo siempre lo manda.
create policy "messages_insert"
  on public.messages
  for insert
  with check (
    auth.role() = 'authenticated'
    and (user_id is null or user_id = auth.uid())
  );

-- Solo el dueño puede editar.
create policy "messages_update_own"
  on public.messages
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Solo el dueño puede borrar (hard-delete; el soft-delete usa update).
create policy "messages_delete_own"
  on public.messages
  for delete
  using (user_id = auth.uid());
