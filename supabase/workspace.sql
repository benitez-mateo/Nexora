-- =============================================================================
-- Nexora · Tablas de workspace (projects + messages) con RLS y realtime
-- =============================================================================
-- Pre-requisito: haber ejecutado supabase/profiles.sql
-- Ejecuta este script una sola vez en Supabase → SQL Editor → New query.
-- Es idempotente: puedes correrlo varias veces sin romper nada.
-- =============================================================================

-- 1. Tabla de proyectos ------------------------------------------------------
-- Las fases y sus entregables van embebidos en `steps` como JSON. Eso simplifica
-- las actualizaciones (mover, editar, marcar entregables) sin perder atomicidad.
create table if not exists public.projects (
  id              uuid        primary key default gen_random_uuid(),
  client          text        not null default '',
  title           text        not null default '',
  final_date      text        not null default '',
  steps           jsonb       not null default '[]'::jsonb,
  active_step_id  bigint,
  created_by      uuid        references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.projects is 'Proyectos del workspace compartido. Los steps van como JSON anidado.';

-- Trigger para actualizar updated_at en cada UPDATE
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- 2. Tabla de mensajes -------------------------------------------------------
create table if not exists public.messages (
  id          text        primary key,
  project_id  uuid        not null references public.projects(id) on delete cascade,
  who         text        not null default '',
  "time"      text        not null default '',
  text        text        not null default '',
  reacts      jsonb       not null default '[]'::jsonb,
  pinned      boolean     not null default false,
  alert       boolean     not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists messages_project_idx
  on public.messages (project_id, created_at);

-- 3. RLS · workspace compartido (todos los autenticados leen y escriben) -----
alter table public.projects enable row level security;
alter table public.messages enable row level security;

drop policy if exists "projects_all_authenticated" on public.projects;
create policy "projects_all_authenticated"
  on public.projects
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "messages_all_authenticated" on public.messages;
create policy "messages_all_authenticated"
  on public.messages
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4. Realtime ---------------------------------------------------------------
-- Habilita las dos tablas en la publicación de Realtime para que el cliente
-- reciba INSERT/UPDATE/DELETE al instante.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'projects'
  ) then
    execute 'alter publication supabase_realtime add table public.projects';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;
end $$;
