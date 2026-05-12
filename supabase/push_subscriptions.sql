-- =============================================================================
-- Nexora · Tabla de suscripciones Web Push
-- =============================================================================
-- Cada usuario puede tener varias suscripciones (una por dispositivo /
-- navegador). El servidor las usa para mandar push notifications cuando
-- la app está cerrada.
--
-- Ejecuta este script una vez en Supabase → SQL Editor → New query.
-- Idempotente.
-- =============================================================================

create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

comment on table public.push_subscriptions is
  'Web Push subscriptions: una por dispositivo. Se borran solas si el endpoint expira (410 Gone) o si se borra el user (cascade).';

-- RLS: cada usuario solo ve y gestiona sus propias suscripciones.
-- El backend usa la service_role key para leer todas y enviar pushes.
alter table public.push_subscriptions enable row level security;

drop policy if exists "push_select_own" on public.push_subscriptions;
create policy "push_select_own"
  on public.push_subscriptions
  for select
  using (user_id = auth.uid());

drop policy if exists "push_insert_own" on public.push_subscriptions;
create policy "push_insert_own"
  on public.push_subscriptions
  for insert
  with check (user_id = auth.uid());

drop policy if exists "push_delete_own" on public.push_subscriptions;
create policy "push_delete_own"
  on public.push_subscriptions
  for delete
  using (user_id = auth.uid());
