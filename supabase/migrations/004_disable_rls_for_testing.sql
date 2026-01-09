-- Disable RLS for testing purposes
-- WARNING: This removes security policies. Only use for development/testing.

-- Disable RLS on services table
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on services
DROP POLICY IF EXISTS "Anyone authenticated can view active services" ON services;
DROP POLICY IF EXISTS "Users can view all services" ON services;
DROP POLICY IF EXISTS "Users can manage services" ON services;
