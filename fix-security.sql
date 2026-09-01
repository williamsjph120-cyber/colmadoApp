-- ============================================
-- SECURITY FIX — Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. ELIMINAR políticas débiles de "Authenticated full access"
DROP POLICY IF EXISTS "Authenticated full access products" ON products;
DROP POLICY IF EXISTS "Authenticated full access sales" ON sales;
DROP POLICY IF EXISTS "Authenticated full access sale_items" ON sale_items;
DROP POLICY IF EXISTS "Authenticated full access credits" ON credits;
DROP POLICY IF EXISTS "Authenticated full access payments" ON payments;
DROP POLICY IF EXISTS "Authenticated full access" ON products;
DROP POLICY IF EXISTS "Authenticated full access" ON sales;
DROP POLICY IF EXISTS "Authenticated full access sale_items" ON sale_items;
DROP POLICY IF EXISTS "Authenticated full access credits" ON credits;
DROP POLICY IF EXISTS "Authenticated full access payments" ON payments;

-- 2. ASEGURAR que existan las políticas correctas por usuario
-- Products
DROP POLICY IF EXISTS "Users view own products" ON products;
DROP POLICY IF EXISTS "Users insert own products" ON products;
DROP POLICY IF EXISTS "Users update own products" ON products;
DROP POLICY IF EXISTS "Users delete own products" ON products;

CREATE POLICY "Users view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Sales
DROP POLICY IF EXISTS "Users view own sales" ON sales;
DROP POLICY IF EXISTS "Users insert own sales" ON sales;
DROP POLICY IF EXISTS "Users update own sales" ON sales;

CREATE POLICY "Users view own sales" ON sales
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sales" ON sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sales" ON sales
  FOR UPDATE USING (auth.uid() = user_id);

-- Sale Items
DROP POLICY IF EXISTS "Users view own sale_items" ON sale_items;
DROP POLICY IF EXISTS "Users insert own sale_items" ON sale_items;

CREATE POLICY "Users view own sale_items" ON sale_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid())
  );
CREATE POLICY "Users insert own sale_items" ON sale_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid())
  );

-- Credits
DROP POLICY IF EXISTS "Users view own credits" ON credits;
DROP POLICY IF EXISTS "Users insert own credits" ON credits;
DROP POLICY IF EXISTS "Users update own credits" ON credits;
DROP POLICY IF EXISTS "Users delete own credits" ON credits;

CREATE POLICY "Users view own credits" ON credits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own credits" ON credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own credits" ON credits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own credits" ON credits
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions
DROP POLICY IF EXISTS "Allow signup subscription insert" ON subscriptions;
DROP POLICY IF EXISTS "Users read own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Admin full access subscriptions" ON subscriptions;

CREATE POLICY "Allow signup subscription insert" ON subscriptions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Payments
DROP POLICY IF EXISTS "Allow payment insert" ON payments;
DROP POLICY IF EXISTS "Users view own payments" ON payments;
DROP POLICY IF EXISTS "Admin full access payments" ON payments;

CREATE POLICY "Allow payment insert" ON payments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- 3. REEMPLAZAR funciones admin con verificación de admin
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  plan text,
  status text,
  created_at timestamptz,
  expires_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Solo el admin puede ejecutar esto
  SELECT 
    s.user_id,
    COALESCE(u.email, 'unknown') as email,
    s.plan,
    s.status,
    s.created_at,
    s.expires_at
  FROM subscriptions s
  LEFT JOIN auth.users u ON u.id = s.user_id
  WHERE auth.uid() = '900c3603-021c-41e2-a3f9-3b92fe8708fa'
  ORDER BY s.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION admin_update_plan(target_user_id uuid, new_plan text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Solo el admin puede ejecutar esto
  UPDATE subscriptions 
  SET plan = new_plan 
  WHERE user_id = target_user_id
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'williamsjph120@gmail.com'
  );
$$;

-- 4. Función para verificar si el usuario actual es admin (para usar en el cliente)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid() = '900c3603-021c-41e2-a3f9-3b92fe8708fa';
$$;

-- 5. Habilitar RLS en todas las tablas (por si acaso)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
