-- ============================================
-- MULTI-TENANCY: Agregar user_id a tablas de negocio
-- ============================================

-- Agregar user_id a products
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Agregar user_id a sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Agregar user_id a credits
ALTER TABLE credits ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Migrar datos existentes al usuario actual
UPDATE products SET user_id = '900c3603-021c-41e2-a3f9-3b92fe8708fa' WHERE user_id IS NULL;
UPDATE sales SET user_id = '900c3603-021c-41e2-a3f9-3b92fe8708fa' WHERE user_id IS NULL;
UPDATE credits SET user_id = '900c3603-021c-41e2-a3f9-3b92fe8708fa' WHERE user_id IS NULL;

-- Hacer user_id NOT NULL después de migrar
ALTER TABLE products ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE sales ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE credits ALTER COLUMN user_id SET NOT NULL;

-- ============================================
-- ACTUALIZAR RLS POLICIES
-- ============================================

-- Eliminar policies antiguas
DROP POLICY IF EXISTS "Authenticated full access" ON products;
DROP POLICY IF EXISTS "Authenticated full access" ON sales;
DROP POLICY IF EXISTS "Authenticated full access" ON sale_items;
DROP POLICY IF EXISTS "Authenticated full access" ON credits;
DROP POLICY IF EXISTS "Authenticated full access products" ON products;
DROP POLICY IF EXISTS "Authenticated full access sales" ON sales;
DROP POLICY IF EXISTS "Authenticated full access sale_items" ON sale_items;
DROP POLICY IF EXISTS "Authenticated full access credits" ON credits;

-- PRODUCTS: cada usuario solo ve sus productos
CREATE POLICY "Users view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- SALES: cada usuario solo ve sus ventas
CREATE POLICY "Users view own sales" ON sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own sales" ON sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own sales" ON sales
  FOR UPDATE USING (auth.uid() = user_id);

-- SALE_ITEMS: acceso a través de sales
CREATE POLICY "Users view own sale_items" ON sale_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid())
  );

CREATE POLICY "Users insert own sale_items" ON sale_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid())
  );

-- CREDITS: cada usuario solo ve sus créditos
CREATE POLICY "Users view own credits" ON credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own credits" ON credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own credits" ON credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own credits" ON credits
  FOR DELETE USING (auth.uid() = user_id);

-- SUBSCRIPTIONS: mantener como está (ya tiene user_id)
DROP POLICY IF EXISTS "Authenticated full access" ON subscriptions;
DROP POLICY IF EXISTS "Allow signup subscription insert" ON subscriptions;
DROP POLICY IF EXISTS "Users read own subscription" ON subscriptions;

CREATE POLICY "Allow signup subscription insert" ON subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin full access subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = '900c3603-021c-41e2-a3f9-3b92fe8708fa');

-- PAYMENTS: mantener como está
DROP POLICY IF EXISTS "Authenticated full access" ON payments;
DROP POLICY IF EXISTS "Allow payment insert" ON payments;

CREATE POLICY "Allow payment insert" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin full access payments" ON payments
  FOR ALL USING (auth.uid() = '900c3603-021c-41e2-a3f9-3b92fe8708fa');
