-- Add INSERT policy for stores table to allow authenticated users to create stores
CREATE POLICY "authenticated_users_can_create_stores"
ON stores
FOR INSERT
TO public
WITH CHECK (auth.uid() IS NOT NULL);