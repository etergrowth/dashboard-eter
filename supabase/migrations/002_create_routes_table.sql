CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  waypoints JSONB NOT NULL DEFAULT '[]',
  total_distance TEXT,
  total_duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own routes"
  ON routes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routes"
  ON routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes"
  ON routes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
  ON routes FOR DELETE
  USING (auth.uid() = user_id);
