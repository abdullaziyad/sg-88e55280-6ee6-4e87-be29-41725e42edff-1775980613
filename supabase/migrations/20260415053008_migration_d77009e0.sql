-- Check and fix store_users RLS policies
SELECT tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'store_users';

-- Add missing INSERT policy for store_users if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'store_users' 
    AND policyname = 'users_can_create_store_users'
  ) THEN
    CREATE POLICY "users_can_create_store_users"
    ON store_users
    FOR INSERT
    TO public
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;