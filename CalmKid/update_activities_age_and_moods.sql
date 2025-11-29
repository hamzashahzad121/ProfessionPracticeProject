-- Add min_age and max_age columns
ALTER TABLE activities ADD COLUMN IF NOT EXISTS min_age INTEGER DEFAULT 1;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS max_age INTEGER DEFAULT 12;

-- Ensure we have activities for all moods
-- Happy
INSERT INTO activities (title, category, description, stars_reward, duration_minutes, mood_tag, min_age, max_age) VALUES
('Dance Party', 'Movement', 'Put on your favorite song and dance like nobody is watching!', 5, 5, 'Happy', 1, 12),
('Draw Your Joy', 'Creativity', 'Draw a picture of what made you happy today.', 4, 10, 'Happy', 4, 12),
('Share a Joke', 'Social', 'Tell a funny joke to a family member.', 3, 2, 'Happy', 5, 12),
('Clap Your Hands', 'Movement', 'Clap your hands to the beat of a happy song.', 2, 2, 'Happy', 1, 5);

-- Calm
INSERT INTO activities (title, category, description, stars_reward, duration_minutes, mood_tag, min_age, max_age) VALUES
('Quiet Reading', 'Focus', 'Read a book or look at pictures quietly.', 5, 15, 'Calm', 6, 12),
('Cloud Watching', 'Relaxation', 'Lie down and watch the clouds float by (or imagine them).', 3, 5, 'Calm', 1, 12),
('Listen to Nature', 'Focus', 'Close your eyes and listen to nature sounds.', 3, 5, 'Calm', 1, 12),
('Soft Humming', 'Relaxation', 'Hum a soft tune to yourself.', 2, 2, 'Calm', 1, 6);

-- Update existing activities to have varied age ranges for better filtering
-- (Assuming some existing IDs or just updating by title/tag)

-- Update Anxious activities
UPDATE activities SET min_age = 5, max_age = 12 WHERE title = '5-4-3-2-1 Game';
UPDATE activities SET min_age = 1, max_age = 12 WHERE title = 'Butterfly Hug';

-- Update Angry activities
UPDATE activities SET min_age = 3, max_age = 12 WHERE title = 'Punch a Pillow';
UPDATE activities SET min_age = 4, max_age = 12 WHERE title = 'Rip the Paper';

-- Update Sad activities
UPDATE activities SET min_age = 4, max_age = 12 WHERE title = 'Happy Memory';
UPDATE activities SET min_age = 1, max_age = 12 WHERE title = 'Cuddle Time';

-- General cleanup for existing items without tags (if any)
UPDATE activities SET mood_tag = 'Happy' WHERE mood_tag IS NULL AND category = 'Creativity';
UPDATE activities SET mood_tag = 'Calm' WHERE mood_tag IS NULL AND category = 'Focus';
