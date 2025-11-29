-- Add 'mood_tag' to activities so we can filter them
alter table activities add column if not exists mood_tag text;

-- Update existing activities with mood tags
update activities set mood_tag = 'Anxious' where category = 'Breathing';
update activities set mood_tag = 'Angry' where category = 'Relaxation';
update activities set mood_tag = 'Sad' where category = 'Creativity';
update activities set mood_tag = 'Hyper' where category = 'Focus';

-- Insert NEW Activities for specific moods
insert into activities (title, category, description, stars_reward, duration_minutes, mood_tag) values
('Punch a Pillow', 'Relaxation', 'It is okay to be mad. Punch a soft pillow 10 times to let it out safely.', 3, 2, 'Angry'),
('Rip the Paper', 'Relaxation', 'Take a piece of scrap paper and rip it into tiny pieces.', 2, 3, 'Angry'),
('Squeeze a Ball', 'Relaxation', 'Squeeze a stress ball or pair of socks as hard as you can.', 2, 1, 'Angry'),

('Happy Memory', 'Creativity', 'Close your eyes and think of your happiest memory.', 3, 5, 'Sad'),
('Talk to a Friend', 'Social', 'Go tell someone you love about your day.', 4, 10, 'Sad'),
('Cuddle Time', 'Relaxation', 'Ask for a hug or cuddle a stuffed animal.', 2, 5, 'Sad'),

('Butterfly Hug', 'Breathing', 'Cross your arms and tap your shoulders slowly like butterfly wings.', 3, 3, 'Anxious'),
('5-4-3-2-1 Game', 'Focus', 'Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.', 5, 5, 'Anxious'),
('Superhero Pose', 'Focus', 'Stand tall like a superhero for 2 minutes to feel brave.', 3, 2, 'Anxious');

-- Insert NEW Challenges
insert into challenges (title, description, reward_stars, is_weekly) values
('Say 3 Nice Things', 'Say 3 nice things to yourself in the mirror.', 5, false),
('No Complaining', 'Try not to complain about anything for 1 hour.', 10, false),
('Help Clean Up', 'Help clean up after dinner without being asked.', 8, false);
