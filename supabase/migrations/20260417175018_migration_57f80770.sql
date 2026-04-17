-- Now recreate stores policies using the helper functions (no recursion)
DROP POLICY IF EXISTS "Users can view their stores" ON stores;
DROP POLICY IF EXISTS "Users can update their stores if admin/owner" ON stores;

CREATE POLICY "stores_select_user_access" ON stores
  FOR SELECT USING (user_has_store_access(id));

CREATE POLICY "stores_update_manager_access" ON stores
  FOR UPDATE USING (user_can_manage_store(id));

CREATE POLICY "stores_delete_owner_access" ON stores
  FOR DELETE USING (user_can_manage_store(id));