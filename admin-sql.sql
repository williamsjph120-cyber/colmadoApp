-- Admin function to get all users with their plans
-- SECURITY DEFINER bypasses RLS so admin can see all users
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  plan text,
  status text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    s.user_id,
    COALESCE(u.email, 'unknown') as email,
    s.plan,
    s.status,
    s.created_at
  FROM subscriptions s
  LEFT JOIN auth.users u ON u.id = s.user_id
  ORDER BY s.created_at DESC;
$$;

-- Admin function to update any user's plan
CREATE OR REPLACE FUNCTION admin_update_plan(target_user_id uuid, new_plan text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE subscriptions SET plan = new_plan WHERE user_id = target_user_id;
$$;
