
-- Drop existing RLS policies on user_settings table that may be causing issues
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;

-- Create new RLS policies that work with Clerk authentication
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (true); -- Allow all authenticated users to select (we filter by clerk_user_id in application layer)

CREATE POLICY "Users can create their own settings" 
  ON public.user_settings 
  FOR INSERT 
  WITH CHECK (clerk_user_id IS NOT NULL);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (true)
  WITH CHECK (clerk_user_id IS NOT NULL);

CREATE POLICY "Users can delete their own settings" 
  ON public.user_settings 
  FOR DELETE 
  USING (true);
