-- Add mood_tag to challenges
alter table challenges add column if not exists mood_tag text;

-- Update existing challenges
update challenges set mood_tag = 'Any' where mood_tag is null;

-- Insert Mood-Specific Challenges
insert into challenges (title, description, reward_stars, is_weekly, mood_tag) values
('Share a Smile', 'Smile at 3 people today.', 5, false, 'Happy'),
('Draw a Dream', 'Draw something you want to do.', 5, false, 'Happy'),
('Talk it Out', 'Tell a parent why you are sad.', 8, false, 'Sad'),
('Cuddle a Toy', 'Hug your favorite toy for 5 minutes.', 5, false, 'Sad'),
('Stomp it Out', 'Stomp your feet 10 times safely.', 5, false, 'Angry'),
('Count to 20', 'Count to 20 slowly before speaking.', 8, false, 'Angry'),
('Deep Breaths', 'Take 10 deep breaths.', 5, false, 'Anxious'),
('Quiet Time', 'Sit quietly for 5 minutes.', 8, false, 'Anxious');
