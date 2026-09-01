-- Allow signup: insert subscription during registration
CREATE POLICY "Allow signup subscription insert" ON subscriptions
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own subscription
CREATE POLICY "Users read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Keep authenticated full access
DROP POLICY IF EXISTS "Authenticated full access" ON products;
DROP POLICY IF EXISTS "Authenticated full access" ON sales;
DROP POLICY IF EXISTS "Authenticated full access" ON sale_items;
DROP POLICY IF EXISTS "Authenticated full access" ON credits;
DROP POLICY IF EXISTS "Authenticated full access" ON payments;

CREATE POLICY "Authenticated full access products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access sales" ON sales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access sale_items" ON sale_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access credits" ON credits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access payments" ON payments FOR ALL USING (auth.role() = 'authenticated');

-- Allow payments insert during upgrade
CREATE POLICY "Allow payment insert" ON payments
  FOR INSERT WITH CHECK (true);
