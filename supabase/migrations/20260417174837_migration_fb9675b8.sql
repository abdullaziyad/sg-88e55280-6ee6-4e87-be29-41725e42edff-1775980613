-- Drop the recursive policies
DROP POLICY IF EXISTS "Owners can manage store users" ON store_users;
DROP POLICY IF EXISTS "Users can view store members" ON store_users;
DROP POLICY IF EXISTS "users_can_create_store_users" ON store_users;

-- Create simple, non-recursive policies
-- Users can see their own store_users records
CREATE POLICY "users_select_own_links" ON store_users
  FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can create store_users links (for signup)
CREATE POLICY "users_insert_links" ON store_users
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own records
CREATE POLICY "users_update_own_links" ON store_users
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own records
CREATE POLICY "users_delete_own_links" ON store_users
  FOR DELETE USING (auth.uid() = user_id);