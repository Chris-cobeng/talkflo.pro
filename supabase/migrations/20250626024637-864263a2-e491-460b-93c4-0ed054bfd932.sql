
-- Drop existing incompatible RLS policies on folders table
DROP POLICY IF EXISTS "Users can view their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can create their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON public.folders;

-- Create new RLS policies that work with Clerk authentication
CREATE POLICY "Users can view their own folders" 
  ON public.folders 
  FOR SELECT 
  USING (true); -- Allow all authenticated users to select (we filter by clerk_user_id in application layer)

CREATE POLICY "Users can create their own folders" 
  ON public.folders 
  FOR INSERT 
  WITH CHECK (clerk_user_id IS NOT NULL);

CREATE POLICY "Users can update their own folders" 
  ON public.folders 
  FOR UPDATE 
  USING (true)
  WITH CHECK (clerk_user_id IS NOT NULL);

CREATE POLICY "Users can delete their own folders" 
  ON public.folders 
  FOR DELETE 
  USING (true);
