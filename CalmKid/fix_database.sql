-- 1. Add mood_tag to activities table if it doesn't exist
ALTER TABLE activities ADD COLUMN IF NOT EXISTS mood_tag text;

-- 2. Enable INSERT/UPDATE policies for Activities
-- Allow authenticated users to insert activities (needed for seeder)
CREATE POLICY "Enable insert for authenticated users only" ON activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON activities FOR UPDATE TO authenticated USING (true);

-- 3. Enable INSERT/UPDATE policies for Challenges
CREATE POLICY "Enable insert for authenticated users only" ON challenges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON challenges FOR UPDATE TO authenticated USING (true);

-- 4. Enable INSERT/UPDATE policies for Rewards
CREATE POLICY "Enable insert for authenticated users only" ON rewards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON rewards FOR UPDATE TO authenticated USING (true);

-- 5. Ensure public read access is still there (just in case)
DROP POLICY IF EXISTS "Public activities" ON activities;
CREATE POLICY "Public activities" ON activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public challenges" ON challenges;
CREATE POLICY "Public challenges" ON challenges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public rewards" ON rewards;
CREATE POLICY "Public rewards" ON rewards FOR SELECT USING (true);
