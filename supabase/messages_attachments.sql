-- =============================================================================
-- Nexora · Adjuntos en mensajes (fotos, videos, archivos)
-- =============================================================================
-- Añade la columna `attachments` a messages y crea el bucket de Storage
-- `chat-attachments` con sus políticas.
--
-- Ejecuta este script una sola vez en Supabase → SQL Editor → New query.
-- Es idempotente.
-- =============================================================================

-- 1. Columna `attachments` en messages --------------------------------------
alter table public.messages
  add column if not exists attachments jsonb not null default '[]'::jsonb;

comment on column public.messages.attachments is
  'Array de adjuntos: [{url, name, type, size}].';

-- 2. Bucket de Storage ------------------------------------------------------
-- Público (cualquier URL del bucket es accesible). Las rutas son por UUID
-- dentro de carpetas {project_id}/{message_id}/, lo que las hace no
-- adivinables para alguien que no esté en el equipo.
insert into storage.buckets (id, name, public, file_size_limit)
values (
  'chat-attachments',
  'chat-attachments',
  true,
  26214400 -- 25 MB por archivo
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

-- 3. Políticas de Storage ---------------------------------------------------
-- Subir: solo autenticados.
drop policy if exists "chat_attachments_insert" on storage.objects;
create policy "chat_attachments_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'chat-attachments');

-- Leer: cualquiera (bucket público para que los <img>/<video> rendericen).
drop policy if exists "chat_attachments_select" on storage.objects;
create policy "chat_attachments_select"
  on storage.objects
  for select
  using (bucket_id = 'chat-attachments');

-- Borrar: solo el owner del archivo.
drop policy if exists "chat_attachments_delete_own" on storage.objects;
create policy "chat_attachments_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'chat-attachments' and owner = auth.uid());
