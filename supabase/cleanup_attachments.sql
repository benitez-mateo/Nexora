-- =============================================================================
-- Nexora · Limpieza OPCIONAL: revertir la feature de adjuntos en mensajes
-- =============================================================================
-- Solo ejecutar si quieres quitar también de Supabase la columna y el bucket.
-- La app ya no usa nada de esto; dejarlo no hace daño, pero ocupa storage
-- gratis.
--
-- Si te sentís cómodo dejando la columna y el bucket por si reactivamos la
-- feature más adelante, NO ejecutes este script.
-- =============================================================================

-- 1. Quitar la columna `attachments` de messages -----------------------------
alter table public.messages drop column if exists attachments;

-- 2. Borrar políticas de Storage --------------------------------------------
drop policy if exists "chat_attachments_insert"     on storage.objects;
drop policy if exists "chat_attachments_select"     on storage.objects;
drop policy if exists "chat_attachments_delete_own" on storage.objects;

-- 3. Borrar el bucket --------------------------------------------------------
-- Esto solo funciona si el bucket está vacío. Si tenés archivos dentro:
--   - Supabase → Storage → chat-attachments → seleccionar todos → Delete
--   - Después corré esto otra vez.
delete from storage.buckets where id = 'chat-attachments';
