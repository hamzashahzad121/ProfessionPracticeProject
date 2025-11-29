import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Checkbox, ProgressBar, Chip } from 'react-native-paper';
import { supabase } from '../services/supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function ChallengesScreen() {
    const [challenges, setChallenges] = useState([]);
    const [userChallenges, setUserChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMood, setCurrentMood] = useState(null);
    const [userStars, setUserStars] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    async function fetchData() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Profile for Stars
        const { data: profile } = await supabase.from('profiles').select('stars').eq('id', user.id).single();
        setUserStars(profile?.stars || 0);

        // 1. Get Today's Mood
        const today = new Date().toISOString().split('T')[0];
        const { data: moodData } = await supabase.from('mood_logs')
            .select('mood')
            .eq('user_id', user.id)
            .gte('created_at', today)
            .order('created_at', { ascending: false })
            .limit(1);

        const mood = moodData && moodData.length > 0 ? moodData[0].mood : null;
        setCurrentMood(mood);

        // 2. Fetch Challenges
        const { data: allChallenges } = await supabase.from('challenges').select('*');

        if (allChallenges) {
            // Sort: Mood-matching first
            const sorted = allChallenges.sort((a, b) => {
                const aMatch = a.mood_tag === mood;
                const bMatch = b.mood_tag === mood;
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return 0;
            });
            setChallenges(sorted);
        }

        const { data: completed } = await supabase.from('user_challenges').select('challenge_id').eq('user_id', user.id);
        if (completed) setUserChallenges(completed.map(c => c.challenge_id));

        setLoading(false);
    }

    async function completeChallenge(challenge) {
        const { data: { user } } = await supabase.auth.getUser();

        // Mark as completed
        const { error } = await supabase.from('user_challenges').insert([{ user_id: user.id, challenge_id: challenge.id, completed: true }]);

        if (!error) {
            // Add stars - Fetch latest first
            const { data: profile } = await supabase.from('profiles').select('stars').eq('id', user.id).single();
            const currentStars = profile?.stars || 0;
            const newStars = currentStars + challenge.reward_stars;

            const { error: updateError } = await supabase.from('profiles').update({ stars: newStars }).eq('id', user.id);

            if (!updateError) {
                setUserStars(newStars); // Update local state
                setUserChallenges([...userChallenges, challenge.id]);
                Alert.alert('Challenge Complete! 🏆', `You earned ${challenge.reward_stars} stars! Total: ${newStars}`);
            } else {
                console.error("Error updating stars:", updateError);
                Alert.alert("Error", "Could not update your stars.");
            }
        } else {
            console.error("Error completing challenge:", error);
            Alert.alert("Error", "Could not mark challenge as complete.");
        }
    }

    // Calculate progress based on visible challenges
    const completedCount = challenges.filter(c => userChallenges.includes(c.id)).length;
    const totalCount = challenges.length;
    const progress = totalCount > 0 ? completedCount / totalCount : 0;

    const renderItem = ({ item }) => {
        const isCompleted = userChallenges.includes(item.id);
        const isRecommended = item.mood_tag === currentMood;

        return (
            <Card style={[styles.card, isCompleted && styles.completedCard, isRecommended && styles.recommendedCard]}>
                <Card.Content style={styles.cardContent}>
                    <View style={{ flex: 1 }}>
                        {isRecommended && <Chip icon="heart" style={styles.recommendedChip} textStyle={{ fontSize: 10, color: '#fff' }}>For You</Chip>}
                        <Title style={[styles.title, isCompleted && styles.completedText]}>{item.title}</Title>
                        <Paragraph style={isCompleted && styles.completedText}>{item.description}</Paragraph>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        {isCompleted ? (
                            <Chip icon="check" style={{ backgroundColor: '#C8E6C9' }}>Done</Chip>
                        ) : (
                            <Chip icon="star" style={{ backgroundColor: '#FFF9C4' }}>{item.reward_stars}</Chip>
                        )}
                    </View>
                </Card.Content>
                {!isCompleted && (
                    <Card.Actions>
                        <Button mode="contained" onPress={() => completeChallenge(item)} style={styles.button}>
                            Mark as Done
                        </Button>
                    </Card.Actions>
                )}
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title style={styles.headerTitle}>Daily Quests ⚔️</Title>
                    <View style={styles.starsContainer}>
                        <Text style={styles.starsText}>⭐ {userStars}</Text>
                    </View>
                </View>
                {currentMood && <Paragraph style={{ textAlign: 'center', color: '#666', marginBottom: 5 }}>Quests for a {currentMood} day</Paragraph>}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Progress: {completedCount}/{totalCount}</Text>
                    <ProgressBar progress={progress} color="#4CAF50" style={styles.progressBar} />
                </View>
            </View>

            <FlatList
                data={challenges}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Paragraph>No challenges found yet.</Paragraph>
                        <Button onPress={() => require('../services/seeder').seedData()}>Load Challenges</Button>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E3F2FD' },
    header: {
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 4,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1565C0',
        textAlign: 'center',
        marginBottom: 5,
    },
    progressContainer: {
        marginTop: 5,
    },
    progressText: {
        textAlign: 'right',
        marginBottom: 5,
        color: '#555',
        fontWeight: 'bold',
    },
    progressBar: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#E0E0E0',
    },
    list: { padding: 16 },
    card: {
        marginBottom: 16,
        borderRadius: 15,
        elevation: 2,
        backgroundColor: '#fff'
    },
    completedCard: {
        backgroundColor: '#E8F5E9',
        opacity: 0.8,
    },
    recommendedCard: {
        borderWidth: 2,
        borderColor: '#2196F3',
        backgroundColor: '#E3F2FD',
    },
    recommendedChip: {
        backgroundColor: '#2196F3',
        alignSelf: 'flex-start',
        marginBottom: 5,
        height: 24,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
    button: {
        backgroundColor: '#2196F3',
        borderRadius: 20,
        marginTop: 10,
    },
    starsContainer: {
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    starsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFD700',
    },
});
