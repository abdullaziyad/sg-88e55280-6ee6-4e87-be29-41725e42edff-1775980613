-- Drop the failed policies
DROP POLICY IF EXISTS "stores_select_own" ON stores;
DROP POLICY IF EXISTS "stores_update_own" ON stores;
DROP POLICY IF EXISTS "stores_delete_own" ON stores;

-- Keep the existing working policies since stores doesn't have owner_id
-- The stores table links to users through store_users table, so the original approach was correct
-- Just make sure they're not causing infinite recursion by using SECURITY DEFINER function

-- Create a helper function to check user store access without recursion
CREATE OR REPLACE FUNCTION user_has_store_access(store_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM store_users
    WHERE store_id = store_id_param
      AND user_id = auth.uid()
  );
$$;

-- Create a helper function to check if user is admin/owner
CREATE OR REPLACE FUNCTION user_can_manage_store(store_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM store_users
    WHERE store_id = store_id_param
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$;