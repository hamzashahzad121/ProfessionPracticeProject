-- Run this in Supabase SQL Editor to update your tables

-- 1. Add new columns to profiles
alter table profiles add column if not exists region text;
alter table profiles add column if not exists school text;

-- 2. Insert some default challenges if not exists
insert into challenges (title, description, reward_stars, is_weekly) values
('Drink Water', 'Drink 5 glasses of water today.', 3, false),
('Read a Book', 'Read for 15 minutes.', 5, false),
('Draw a Picture', 'Draw something that makes you happy.', 4, false)
on conflict do nothing;

-- 3. Insert some default rewards if not exists
insert into rewards (title, cost, type) values
('Funny Hat Avatar', 12, 'Avatar'),
('Dinosaur Sticker', 8, 'Sticker'),
('Rainforest Sounds', 15, 'Music')
on conflict do nothing;
