-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Child's profile)
create table profiles (
  id uuid references auth.users not null primary key,
  name text,
  age int,
  avatar_url text,
  stars int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. MOOD LOGS
create table mood_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  mood text not null, -- 'happy', 'sad', 'angry', 'calm', 'anxious'
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ACTIVITIES (Pre-defined activities)
create table activities (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  category text not null, -- 'Breathing', 'Focus', 'Relaxation', 'Creativity'
  description text,
  stars_reward int default 1,
  duration_minutes int default 5
);

-- Insert some default activities
insert into activities (title, category, description, stars_reward, duration_minutes) values
('Deep Breathing', 'Breathing', 'Take 5 deep breaths. Inhale for 4 seconds, hold for 4, exhale for 4.', 2, 2),
('Count to 10', 'Focus', 'Close your eyes and count to 10 slowly.', 1, 1),
('Draw Your Feelings', 'Creativity', 'Draw a picture of how you feel right now.', 3, 10),
('Muscle Relaxation', 'Relaxation', 'Squeeze your hands into fists, then let go. Do this 5 times.', 2, 3),
('Listen to Quiet Music', 'Relaxation', 'Listen to a calming song.', 2, 5);

-- 4. ACTIVITY LOGS (Completed activities)
create table activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  activity_id uuid references activities(id) not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. BEHAVIOR JOURNAL (Parent notes)
create table behavior_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  note text not null,
  severity text, -- 'Low', 'Medium', 'High'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. TRIGGERS
create table triggers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  trigger_name text not null, -- 'Hunger', 'Tiredness', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. REWARDS (Store)
create table rewards (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  cost int not null,
  type text not null, -- 'Sticker', 'Avatar', 'Theme', 'Music'
  image_url text
);

-- Insert some default rewards
insert into rewards (title, cost, type) values
('Cool Sunglasses Avatar', 10, 'Avatar'),
('Super Hero Sticker', 5, 'Sticker'),
('Space Theme', 20, 'Theme'),
('Ocean Sounds', 15, 'Music');

-- 8. USER REWARDS (Unlocked items)
create table user_rewards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  reward_id uuid references rewards(id) not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. CHALLENGES
create table challenges (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  reward_stars int default 5,
  is_weekly boolean default false
);

insert into challenges (title, description, reward_stars, is_weekly) values
('No Shouting Today', 'Try to speak softly all day.', 5, false),
('Clean Your Room', 'Put away all your toys.', 10, false),
('Help a Friend', 'Do something nice for someone.', 5, false);

-- 10. USER CHALLENGES (Progress)
create table user_challenges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  challenge_id uuid references challenges(id) not null,
  completed boolean default false,
  completed_at timestamp with time zone
);

-- RLS POLICIES (Simple for now, allow authenticated users to read/write their own data)
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- (Repeat similar policies for other tables linking to user_id, or make public for simplicity if it's a single user app, but best practice is RLS)
-- For simplicity in this starter kit, we will allow public read for 'activities' and 'rewards' and 'challenges'
alter table activities enable row level security;
create policy "Public activities" on activities for select using (true);

alter table rewards enable row level security;
create policy "Public rewards" on rewards for select using (true);

alter table challenges enable row level security;
create policy "Public challenges" on challenges for select using (true);

-- For user specific tables
alter table mood_logs enable row level security;
create policy "User mood logs" on mood_logs for all using (auth.uid() = user_id);

alter table activity_logs enable row level security;
create policy "User activity logs" on activity_logs for all using (auth.uid() = user_id);

alter table behavior_logs enable row level security;
create policy "User behavior logs" on behavior_logs for all using (auth.uid() = user_id);

alter table triggers enable row level security;
create policy "User triggers" on triggers for all using (auth.uid() = user_id);

alter table user_rewards enable row level security;
create policy "User rewards" on user_rewards for all using (auth.uid() = user_id);

alter table user_challenges enable row level security;
create policy "User challenges" on user_challenges for all using (auth.uid() = user_id);
