import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../services/supabase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ActivitiesScreen() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMood, setCurrentMood] = useState(null);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            fetchMoodAndActivities();
        }, [])
    );

    const [userStars, setUserStars] = useState(0);

    async function fetchMoodAndActivities() {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profileData } = await supabase.from('profiles').select('stars, age').eq('id', user.id).single();
                setUserStars(profileData?.stars || 0);

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

                // 2. Fetch Activities
                let query = supabase.from('activities').select('*');

                // Filter by age if available
                if (profileData?.age) {
                    query = query.lte('min_age', profileData.age).gte('max_age', profileData.age);
                }

                const { data: allActivities, error } = await query;

                if (error) {
                    console.log('Error fetching activities (likely schema mismatch, falling back):', error);
                    const { data: fallback } = await supabase.from('activities').select('*');
                    if (fallback) processActivities(fallback, mood);
                } else if (allActivities) {
                    processActivities(allActivities, mood);
                }
            }
        } catch (error) {
            console.error("Error fetching activities:", error);
            Alert.alert("Error", "Could not load activities.");
        } finally {
            setLoading(false);
        }
    }

    function processActivities(data, mood) {
        // Sort: Mood-matching first, then others
        const sorted = data.sort((a, b) => {
            const aMatch = isMoodMatch(a.mood_tag, mood);
            const bMatch = isMoodMatch(b.mood_tag, mood);
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
        });
        setActivities(sorted);
    }

    function isMoodMatch(activityTag, userMood) {
        if (!userMood || !activityTag) return false;
        return activityTag === userMood;
    }

    function getCategoryColor(category) {
        switch (category) {
            case 'Breathing': return '#42A5F5';
            case 'Focus': return '#AB47BC';
            case 'Relaxation': return '#66BB6A';
            case 'Creativity': return '#FFA726';
            default: return '#78909C';
        }
    }

    const renderItem = ({ item }) => {
        const isRecommended = isMoodMatch(item.mood_tag, currentMood);

        return (
            <Card style={[styles.card, { borderLeftColor: getCategoryColor(item.category), borderLeftWidth: 5 }, isRecommended && styles.recommendedCard]}>
                <Card.Content>
                    {isRecommended && (
                        <Chip icon="heart" style={styles.recommendedChip} textStyle={{ color: '#fff' }}>Recommended for {currentMood}</Chip>
                    )}
                    <View style={styles.cardHeader}>
                        <Title style={{ color: '#333' }}>{item.title}</Title>
                        <Chip icon="star" style={styles.chip} textStyle={{ color: '#8D6E63' }}>{item.stars_reward}</Chip>
                    </View>
                    <Paragraph style={[styles.category, { color: getCategoryColor(item.category) }]}>{item.category}</Paragraph>
                    <Paragraph style={{ color: '#555' }}>{item.description}</Paragraph>
                    <View style={styles.durationContainer}>
                        <Text style={{ fontSize: 12, color: '#777' }}>⏱ {item.duration_minutes} mins</Text>
                    </View>
                </Card.Content>
                <Card.Actions>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('ActivityTimer', { activity: item })}
                        style={{ backgroundColor: getCategoryColor(item.category), borderRadius: 20 }}
                    >
                        Start Activity
                    </Button>
                </Card.Actions>
            </Card>
        );
    };

    if (loading) {
        return <View style={styles.loading}><ActivityIndicator size="large" color="#FF7043" /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Title style={styles.headerTitle}>Fun Activities 🎨</Title>
                <View style={styles.starsContainer}>
                    <Text style={styles.starsText}>⭐ {userStars}</Text>
                </View>
            </View>
            {currentMood && <Paragraph style={{ textAlign: 'center', marginBottom: 10, color: '#666' }}>Because you are feeling {currentMood}...</Paragraph>}
            <FlatList
                data={activities}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Paragraph>No activities found yet.</Paragraph>
                        <Button onPress={() => require('../services/seeder').seedData()}>Load Activities</Button>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0F7FA',
        paddingTop: 40,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#006064',
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
    list: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        borderRadius: 15,
        backgroundColor: '#fff',
        elevation: 3,
    },
    recommendedCard: {
        borderColor: '#FF7043',
        borderWidth: 2,
        backgroundColor: '#FFF3E0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    chip: {
        backgroundColor: '#FFF8E1',
    },
    recommendedChip: {
        backgroundColor: '#FF7043',
        alignSelf: 'flex-start',
        marginBottom: 5,
    },
    category: {
        fontSize: 12,
        marginBottom: 5,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    durationContainer: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E0F7FA',
    },
});
