-- =============================================================================
-- Nexora · Tabla `profiles` con sincronización automática a auth.users
-- =============================================================================
-- Ejecuta este script una sola vez en Supabase → SQL Editor → New query.
-- Es idempotente: puedes correrlo varias veces sin romper nada.
-- =============================================================================

-- 1. Tabla de perfiles -------------------------------------------------------
create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  email       text        not null,
  name        text        not null default '',
  avatar      text        not null default '',
  role        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Datos públicos del usuario, sincronizados con auth.users vía trigger.';

-- 2. Función que crea un perfil cuando se registra un usuario nuevo ---------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar', ''),
    nullif(new.raw_user_meta_data->>'role', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Función que sincroniza cambios de auth.users → profiles ----------------
create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email      = new.email,
    name       = coalesce(new.raw_user_meta_data->>'name', name),
    avatar     = coalesce(new.raw_user_meta_data->>'avatar', avatar),
    role       = nullif(new.raw_user_meta_data->>'role', ''),
    updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_user_update();

-- 4. RLS (Row Level Security) -----------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_read_authenticated" on public.profiles;
create policy "profiles_read_authenticated"
  on public.profiles
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 5. Backfill: crea perfiles para los usuarios que ya existían --------------
insert into public.profiles (id, email, name, avatar, role, created_at)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'avatar', ''),
  nullif(u.raw_user_meta_data->>'role', ''),
  u.created_at
from auth.users u
on conflict (id) do nothing;
