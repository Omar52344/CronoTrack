# Configuración de Supabase para CronoTrack

## 1. Crear proyecto en Supabase
- Ve a [supabase.com](https://supabase.com) y crea una cuenta.
- Crea un nuevo proyecto.
- Anota la URL del proyecto y la clave anónima (anon key) desde Settings > API.

## 2. Actualizar environment.ts
- Reemplaza 'TU_SUPABASE_URL' y 'TU_SUPABASE_ANON_KEY' en `src/environments/environment.ts` con tus valores reales.

## 3. Crear tablas en Supabase
Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Crear tabla projects
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  color text default '#4f46e5',
  created_at timestamp default now()
);

-- Crear tabla categories
create table categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  color text default '#10b981',
  created_at timestamp default now()
);

-- Crear tabla activities
create table activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  project_id uuid references projects(id),
  category_id uuid references categories(id),
  description text,
  start_time timestamp not null,
  end_time timestamp,
  duration int, -- en minutos
  created_at timestamp default now()
);

-- Políticas RLS (Row Level Security)
-- Para projects
alter table projects enable row level security;

-- Trigger para asignar user_id automáticamente en inserts
create or replace function public.handle_new_project()
returns trigger as $$
begin
  new.user_id = auth.uid();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_project_insert
  before insert on public.projects
  for each row execute procedure public.handle_new_project();

create policy "Users can view their own projects" on projects for select using (auth.uid() = user_id);
create policy "Users can insert their own projects" on projects for insert with check (auth.uid() = user_id);
create policy "Users can update their own projects" on projects for update using (auth.uid() = user_id);
create policy "Users can delete their own projects" on projects for delete using (auth.uid() = user_id);

-- Para categories
alter table categories enable row level security;

-- Trigger para asignar user_id automáticamente en inserts
create or replace function public.handle_new_category()
returns trigger as $$
begin
  new.user_id = auth.uid();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_category_insert
  before insert on public.categories
  for each row execute procedure public.handle_new_category();

create policy "Users can view their own categories" on categories for select using (auth.uid() = user_id);
create policy "Users can insert their own categories" on categories for insert with check (auth.uid() = user_id);
create policy "Users can update their own categories" on categories for update using (auth.uid() = user_id);
create policy "Users can delete their own categories" on categories for delete using (auth.uid() = user_id);

-- Para activities
alter table activities enable row level security;

-- Trigger para asignar user_id automáticamente en inserts
create or replace function public.handle_new_activity()
returns trigger as $$
begin
  new.user_id = auth.uid();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_activity_insert
  before insert on public.activities
  for each row execute procedure public.handle_new_activity();

create policy "Users can view their own activities" on activities for select using (auth.uid() = user_id);
create policy "Users can insert their own activities" on activities for insert with check (auth.uid() = user_id);
create policy "Users can update their own activities" on activities for update using (auth.uid() = user_id);
create policy "Users can delete their own activities" on activities for delete using (auth.uid() = user_id);
```

## 4. Configurar autenticación
- En Supabase Dashboard, ve a Authentication > Settings.
- Configura los proveedores de autenticación (email/password ya está habilitado por defecto).
- Para Google Auth, configura el OAuth en Authentication > Providers > Google.

¡Listo! Tu base de datos está configurada.