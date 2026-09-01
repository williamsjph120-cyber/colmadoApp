============================================
ColmadoApp — Script SQL para Supabase
============================================
Pegar esto en: Supabase Dashboard → SQL Editor → New query → Run
============================================

-- ==========================================
-- TABLA: products
-- ==========================================
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text default 'abarrotes',
  emoji text default '📦',
  price numeric default 0,
  stock integer default 0,
  min_stock integer default 5,
  created_at timestamptz default now()
);

-- ==========================================
-- TABLA: sales
-- ==========================================
create table if not exists sales (
  id uuid default gen_random_uuid() primary key,
  date date default current_date,
  subtotal numeric default 0,
  tax numeric default 0,
  total numeric default 0,
  method text default 'efectivo',
  client_name text,
  concept text,
  created_at timestamptz default now()
);

-- ==========================================
-- TABLA: sale_items
-- ==========================================
create table if not exists sale_items (
  id uuid default gen_random_uuid() primary key,
  sale_id uuid references sales(id) on delete cascade,
  product_id uuid references products(id),
  product_name text,
  product_emoji text,
  price numeric,
  qty integer default 1
);

-- ==========================================
-- TABLA: credits
-- ==========================================
create table if not exists credits (
  id uuid default gen_random_uuid() primary key,
  client text not null,
  amount numeric default 0,
  paid numeric default 0,
  pending numeric default 0,
  status text default 'pendiente',
  concept text,
  sale_id uuid references sales(id),
  date date default current_date,
  created_at timestamptz default now()
);

-- ==========================================
-- TABLA: subscriptions
-- ==========================================
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  plan text default 'gratis',
  status text default 'activo',
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ==========================================
-- TABLA: payments
-- ==========================================
create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  amount numeric not null,
  plan text not null,
  receipt_url text,
  status text default 'pendiente',
  admin_note text,
  created_at timestamptz default now()
);

-- ==========================================
-- RLS (Row Level Security)
-- ==========================================
alter table products enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table credits enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;

-- ==========================================
-- POLÍTICAS (acceso completo autenticado)
-- ==========================================
create policy "Authenticated full access" on products for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on sales for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on sale_items for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on credits for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on subscriptions for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on payments for all using (auth.role() = 'authenticated');

-- ==========================================
-- PRODUCTOS INICIALES (opcional)
-- ==========================================
insert into products (name, category, emoji, price, stock, min_stock) values
  ('Aceite 1L', 'abarrotes', '🥫', 3.50, 24, 5),
  ('Arroz 1kg', 'abarrotes', '🍚', 1.20, 50, 10),
  ('Azúcar 1kg', 'abarrotes', '🧂', 1.10, 30, 10),
  ('Coca-Cola 2L', 'bebidas', '🥤', 2.00, 12, 5),
  ('Pepsi 2L', 'bebidas', '🥤', 2.00, 8, 5),
  ('Leche 1L', 'lacteos', '🥛', 1.80, 15, 5),
  ('Mantequilla', 'lacteos', '🧈', 1.50, 10, 3),
  ('Pollo 1kg', 'carnes', '🍗', 3.00, 20, 5),
  ('Jabón líquido', 'limpieza', '🧴', 2.50, 6, 3),
  ('Pasta dental', 'higiene', '🪥', 1.80, 9, 3),
  ('Huevos (12u)', 'abarrotes', '🥚', 2.80, 18, 5),
  ('Pan banging', 'abarrotes', '🍞', 0.50, 40, 10);
