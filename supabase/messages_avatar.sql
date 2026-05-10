-- =============================================================================
-- Nexora · Migración: añade columna `avatar` a la tabla `messages`
-- =============================================================================
-- Ejecuta este script una sola vez en Supabase → SQL Editor → New query.
-- Es idempotente: si la columna ya existe, no hace nada.
-- =============================================================================

alter table public.messages
  add column if not exists avatar text;

comment on column public.messages.avatar is
  'Snapshot del avatar del autor en el momento de enviar el mensaje (id de preset o data-URL).';
