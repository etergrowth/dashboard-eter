-- =============================================
-- ENABLE RLS FOR SERVICES TABLE
-- =============================================
-- Re-enable RLS with secure policies for authenticated users only

-- Enable RLS on services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Anyone authenticated can view active services" ON services;
DROP POLICY IF EXISTS "Users can view all services" ON services;
DROP POLICY IF EXISTS "Users can manage services" ON services;

-- Create separate policies for each operation

-- SELECT: Authenticated users can view all services
CREATE POLICY "Authenticated users can view all services"
  ON services FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT: Authenticated users can create services
CREATE POLICY "Authenticated users can create services"
  ON services FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Authenticated users can update services
-- This also covers soft delete (UPDATE is_active = false)
CREATE POLICY "Authenticated users can update services"
  ON services FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Note: DELETE is not needed as we use soft delete (UPDATE is_active = false)
-- The UPDATE policy already covers this functionality
