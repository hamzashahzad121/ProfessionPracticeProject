import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Avatar, useTheme, ProgressBar, Chip } from 'react-native-paper';
import { supabase } from '../services/supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
    const [profile, setProfile] = useState(null);
    const [todaysMood, setTodaysMood] = useState(null);
    const [selectedMood, setSelectedMood] = useState(null);
    const [loading, setLoading] = useState(false);
    const [suggestedActivities, setSuggestedActivities] = useState([]);
    const [challengeProgress, setChallengeProgress] = useState(0);

    async function loadData() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Profile to get Age
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) {
            setProfile(profileData);
        }

        // 2. Fetch Today's Mood
        const today = new Date().toISOString().split('T')[0];
        const { data: moodData } = await supabase.from('mood_logs').select('*').eq('user_id', user.id).gte('created_at', today).limit(1);

        let currentMood = null;
        if (moodData && moodData.length > 0) {
            setTodaysMood(moodData[0]);
            currentMood = moodData[0].mood;
        }

        // 3. Fetch Suggestions if we have a mood
        if (currentMood) {
            await fetchSuggestions(currentMood, profileData?.age);
        }

        // 4. Fetch Challenge Progress
        const { count: totalCount } = await supabase.from('challenges').select('*', { count: 'exact', head: true });
        const { count: completedCount } = await supabase.from('user_challenges').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

        if (totalCount && totalCount > 0) {
            setChallengeProgress(completedCount / totalCount);
        } else {
            setChallengeProgress(0);
        }

        setLoading(false);
    }

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    async function fetchSuggestions(mood, age) {
        let query = supabase
            .from('activities')
            .select('*')
            .eq('mood_tag', mood);

        // Filter by age if available
        if (age) {
            query = query.lte('min_age', age).gte('max_age', age);
        }

        const { data, error } = await query.limit(3);

        if (error) {
            console.log('Error fetching activities:', error);
            // Fallback if columns don't exist yet
            const { data: fallbackData } = await supabase
                .from('activities')
                .select('*')
                .eq('mood_tag', mood)
                .limit(3);
            if (fallbackData) setSuggestedActivities(fallbackData);
        } else if (data) {
            setSuggestedActivities(data);
        }
    }

    const moods = [
        { label: 'Happy', emoji: '😊', color: '#FFF176' },
        { label: 'Sad', emoji: '😢', color: '#81D4FA' },
        { label: 'Angry', emoji: '😡', color: '#FF8A65' },
        { label: 'Calm', emoji: '😌', color: '#A5D6A7' },
        { label: 'Anxious', emoji: '😰', color: '#CE93D8' },
    ];

    async function submitMood() {
        if (!selectedMood) return;
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('mood_logs').insert([{ user_id: user.id, mood: selectedMood.label }]);
        setLoading(false);

        if (!error) {
            setTodaysMood({ mood: selectedMood.label });
            fetchSuggestions(selectedMood.label, profile?.age);
            Alert.alert('Mood Logged!', 'Check out the suggested activities below!');
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Title style={styles.greeting}>Hi, {profile?.name || 'Friend'}! 🌟</Title>
                    <Paragraph style={styles.subGreeting}>Ready for a great day?</Paragraph>
                </View>
                <View style={styles.starsContainer}>
                    <Text style={styles.starsText}>⭐ {profile?.stars || 0}</Text>
                </View>
            </View>

            {/* Mood Section */}
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>How are you feeling today?</Title>
                    {todaysMood ? (
                        <View style={styles.loggedMood}>
                            <Text style={{ fontSize: 60 }}>
                                {moods.find(m => m.label === todaysMood.mood)?.emoji}
                            </Text>
                            <Title style={{ color: '#555', marginTop: 10 }}>
                                You are feeling {todaysMood.mood}
                            </Title>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.moodsContainer}>
                                {moods.map((m) => (
                                    <TouchableOpacity
                                        key={m.label}
                                        onPress={() => setSelectedMood(m)}
                                        style={[
                                            styles.moodButton,
                                            { backgroundColor: m.color },
                                            selectedMood?.label === m.label && styles.selectedMood
                                        ]}
                                    >
                                        <Text style={styles.moodEmoji}>{m.emoji}</Text>
                                        <Text style={styles.moodLabel}>{m.label}</Text>
                                        {selectedMood?.label === m.label && <View style={styles.checkMark}><Text>✅</Text></View>}
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Button
                                mode="contained"
                                onPress={submitMood}
                                disabled={!selectedMood || loading}
                                style={styles.submitButton}
                                labelStyle={{ fontSize: 18 }}
                            >
                                {loading ? 'Saving...' : 'Log My Mood'}
                            </Button>
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* Suggested Activities based on Mood */}
            {suggestedActivities.length > 0 && (
                <View>
                    <Title style={styles.sectionTitle}>
                        {todaysMood?.mood === 'Happy' ? 'Keep the fun going! 🎈' : 'Try these to feel better 💖'}
                    </Title>
                    {suggestedActivities.map((activity) => (
                        <Card key={activity.id} style={styles.suggestionCard} onPress={() => navigation.navigate('Activities')}>
                            <Card.Content style={styles.suggestionContent}>
                                <View style={{ flex: 1 }}>
                                    <Title style={styles.suggestionTitle}>{activity.title}</Title>
                                    <Paragraph numberOfLines={1}>{activity.description}</Paragraph>
                                </View>
                                <Chip icon="star" style={{ backgroundColor: '#FFF8E1' }}>{activity.stars_reward}</Chip>
                            </Card.Content>
                        </Card>
                    ))}
                </View>
            )}

            {/* Daily Challenge Preview */}
            <Card style={[styles.card, { backgroundColor: '#E1F5FE', marginTop: 20 }]}>
                <Card.Content>
                    <Title>🏆 Daily Challenge</Title>
                    <Paragraph>Check your daily quests and earn stars!</Paragraph>
                    <ProgressBar progress={challengeProgress} color="#03A9F4" style={{ height: 10, borderRadius: 5, marginVertical: 10 }} />
                    <Paragraph style={{ textAlign: 'right', fontSize: 12 }}>{Math.round(challengeProgress * 100)}% Complete</Paragraph>
                </Card.Content>
                <Card.Actions>
                    <Button onPress={() => navigation.navigate('Challenges')}>Go to Quests</Button>
                </Card.Actions>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0F7FA',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 30,
    },
    greeting: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#006064',
    },
    subGreeting: {
        fontSize: 14,
        color: '#00838F',
    },
    starsContainer: {
        backgroundColor: '#FFF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 25,
        elevation: 4,
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    starsText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    card: {
        marginBottom: 10,
        borderRadius: 20,
        elevation: 4,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    cardTitle: {
        textAlign: 'center',
        marginBottom: 15,
        color: '#333',
    },
    moodsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 10,
    },
    moodButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 65,
        height: 65,
        borderRadius: 35,
        elevation: 2,
    },
    selectedMood: {
        borderWidth: 3,
        borderColor: '#4CAF50',
        transform: [{ scale: 1.1 }],
    },
    moodEmoji: {
        fontSize: 30,
    },
    moodLabel: {
        fontSize: 10,
        marginTop: 2,
        fontWeight: 'bold',
        color: '#333',
    },
    checkMark: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 2,
        elevation: 3,
    },
    submitButton: {
        marginTop: 20,
        backgroundColor: '#FF7043',
        borderRadius: 15,
        paddingVertical: 5,
    },
    loggedMood: {
        alignItems: 'center',
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#006064',
        marginTop: 20,
        marginBottom: 10,
    },
    suggestionCard: {
        marginBottom: 10,
        borderRadius: 15,
        backgroundColor: '#fff',
    },
    suggestionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    suggestionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});
