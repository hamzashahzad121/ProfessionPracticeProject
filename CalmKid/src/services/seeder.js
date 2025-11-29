import { supabase } from './supabase';
import { Alert } from 'react-native';

export const seedData = async () => {
    try {
        // 1. Check if activities exist
        const { data: existingActivities } = await supabase.from('activities').select('title');
        const existingTitles = existingActivities ? existingActivities.map(a => a.title) : [];

        const activities = [
            { title: 'Deep Breathing', category: 'Breathing', description: 'Take 5 deep breaths. Inhale for 4s, hold 4s, exhale 4s.', stars_reward: 2, duration_minutes: 2, mood_tag: 'Anxious' },
            { title: 'Count to 10', category: 'Focus', description: 'Close your eyes and count to 10 slowly.', stars_reward: 1, duration_minutes: 1, mood_tag: 'Hyper' },
            { title: 'Draw Your Feelings', category: 'Creativity', description: 'Draw a picture of how you feel right now.', stars_reward: 3, duration_minutes: 10, mood_tag: 'Sad' },
            { title: 'Muscle Relaxation', category: 'Relaxation', description: 'Squeeze your hands into fists, then let go. Do this 5 times.', stars_reward: 2, duration_minutes: 3, mood_tag: 'Angry' },
            { title: 'Listen to Quiet Music', category: 'Relaxation', description: 'Listen to a calming song.', stars_reward: 2, duration_minutes: 5, mood_tag: 'Anxious' },
            { title: 'Punch a Pillow', category: 'Relaxation', description: 'It is okay to be mad. Punch a soft pillow 10 times.', stars_reward: 3, duration_minutes: 2, mood_tag: 'Angry' },
            { title: 'Happy Memory', category: 'Creativity', description: 'Close your eyes and think of your happiest memory.', stars_reward: 3, duration_minutes: 5, mood_tag: 'Sad' },
            { title: 'Superhero Pose', category: 'Focus', description: 'Stand tall like a superhero for 2 minutes.', stars_reward: 3, duration_minutes: 2, mood_tag: 'Anxious' },
            { title: 'Dance Party', category: 'Creativity', description: 'Dance to your favorite song!', stars_reward: 5, duration_minutes: 5, mood_tag: 'Happy' },
            { title: 'Build a Fort', category: 'Creativity', description: 'Use blankets and pillows to build a fort.', stars_reward: 10, duration_minutes: 20, mood_tag: 'Happy' },
            { title: 'Read a Book', category: 'Focus', description: 'Read a few pages of a book.', stars_reward: 5, duration_minutes: 15, mood_tag: 'Calm' },
            { title: 'Nature Walk', category: 'Relaxation', description: 'Walk outside and look for birds.', stars_reward: 5, duration_minutes: 10, mood_tag: 'Calm' }
        ];

        const newActivities = activities.filter(a => !existingTitles.includes(a.title));

        if (newActivities.length > 0) {
            const { error } = await supabase.from('activities').insert(newActivities);
            if (error) throw error;
        }

        // 2. Check if challenges exist
        const { data: existingChallenges } = await supabase.from('challenges').select('title');
        const existingChallengeTitles = existingChallenges ? existingChallenges.map(c => c.title) : [];

        const challenges = [
            { title: 'No Shouting Today', description: 'Try to speak softly all day.', reward_stars: 5, is_weekly: false, mood_tag: 'Angry' },
            { title: 'Clean Your Room', description: 'Put away all your toys.', reward_stars: 10, is_weekly: false, mood_tag: 'Happy' },
            { title: 'Help a Friend', description: 'Do something nice for someone.', reward_stars: 5, is_weekly: false, mood_tag: 'Happy' },
            { title: 'Drink Water', description: 'Drink 5 glasses of water today.', reward_stars: 3, is_weekly: false, mood_tag: 'Any' },
            { title: 'Say 3 Nice Things', description: 'Say 3 nice things to yourself in the mirror.', reward_stars: 5, is_weekly: false, mood_tag: 'Sad' },
            { title: 'Share a Smile', description: 'Smile at 3 people today.', reward_stars: 5, is_weekly: false, mood_tag: 'Happy' },
            { title: 'Draw a Dream', description: 'Draw something you want to do.', reward_stars: 5, is_weekly: false, mood_tag: 'Happy' },
            { title: 'Talk it Out', description: 'Tell a parent why you are sad.', reward_stars: 8, is_weekly: false, mood_tag: 'Sad' },
            { title: 'Cuddle a Toy', description: 'Hug your favorite toy for 5 minutes.', reward_stars: 5, is_weekly: false, mood_tag: 'Sad' },
            { title: 'Stomp it Out', description: 'Stomp your feet 10 times safely.', reward_stars: 5, is_weekly: false, mood_tag: 'Angry' },
            { title: 'Count to 20', description: 'Count to 20 slowly before speaking.', reward_stars: 8, is_weekly: false, mood_tag: 'Angry' },
            { title: 'Deep Breaths', description: 'Take 10 deep breaths.', reward_stars: 5, is_weekly: false, mood_tag: 'Anxious' },
            { title: 'Quiet Time', description: 'Sit quietly for 5 minutes.', reward_stars: 8, is_weekly: false, mood_tag: 'Anxious' }
        ];

        const newChallenges = challenges.filter(c => !existingChallengeTitles.includes(c.title));

        if (newChallenges.length > 0) {
            const { error } = await supabase.from('challenges').insert(newChallenges);
            if (error) throw error;
        }

        // 3. Check if rewards exist
        const { data: existingRewards } = await supabase.from('rewards').select('id').limit(1);

        if (!existingRewards || existingRewards.length === 0) {
            const rewards = [
                { title: 'Cool Sunglasses Avatar', cost: 10, type: 'Avatar' },
                { title: 'Super Hero Sticker', cost: 5, type: 'Sticker' },
                { title: 'Space Theme', cost: 20, type: 'Theme' },
                { title: 'Ocean Sounds', cost: 15, type: 'Music' },
                { title: 'Funny Hat Avatar', cost: 12, type: 'Avatar' },
                { title: 'Dinosaur Sticker', cost: 8, type: 'Sticker' }
            ];

            const { error } = await supabase.from('rewards').insert(rewards);
            if (error) throw error;
        }

        Alert.alert('Success', 'App data has been loaded! Pull down to refresh pages.');

    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Could not load data: ' + error.message);
    }
};
