import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Image } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../services/supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function RewardsScreen() {
    const [rewards, setRewards] = useState([]);
    const [userRewards, setUserRewards] = useState([]);
    const [stars, setStars] = useState(0);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    async function fetchData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase.from('profiles').select('stars').eq('id', user.id).single();
        if (profile) setStars(profile.stars);

        const { data: allRewards } = await supabase.from('rewards').select('*');
        if (allRewards) setRewards(allRewards);

        const { data: unlocked } = await supabase.from('user_rewards').select('reward_id').eq('user_id', user.id);
        if (unlocked) setUserRewards(unlocked.map(r => r.reward_id));

        setLoading(false);
    }

    async function buyReward(reward) {
        if (stars < reward.cost) {
            Alert.alert('Not enough stars!', 'Keep doing good tasks to earn more stars.');
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();

        // Deduct stars
        const newStars = stars - reward.cost;
        await supabase.from('profiles').update({ stars: newStars }).eq('id', user.id);
        setStars(newStars);

        // Unlock reward
        await supabase.from('user_rewards').insert([{ user_id: user.id, reward_id: reward.id }]);
        setUserRewards([...userRewards, reward.id]);

        Alert.alert('Yay! 🎁', `You unlocked ${reward.title}!`);
    }

    const renderItem = ({ item }) => {
        const isUnlocked = userRewards.includes(item.id);
        return (
            <Card style={[styles.card, isUnlocked && styles.unlockedCard]}>
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <Title style={isUnlocked ? { color: '#2E7D32', textDecorationLine: 'line-through' } : { color: '#333' }}>{item.title}</Title>
                            <Paragraph style={{ color: '#666' }}>{item.type}</Paragraph>
                        </View>
                        {isUnlocked ? (
                            <Chip icon="check" style={styles.unlockedChip} textStyle={{ color: '#1B5E20' }}>Owned</Chip>
                        ) : (
                            <Chip icon="star" style={styles.costChip} textStyle={{ color: '#F57F17' }}>{item.cost}</Chip>
                        )}
                    </View>
                </Card.Content>
                <Card.Actions>
                    <Button
                        mode={isUnlocked ? "outlined" : "contained"}
                        onPress={() => !isUnlocked && buyReward(item)}
                        disabled={isUnlocked}
                        style={isUnlocked ? {} : { backgroundColor: '#FF7043' }}
                        labelStyle={isUnlocked ? { color: '#2E7D32' } : { color: '#fff' }}
                    >
                        {isUnlocked ? 'Unlocked' : 'Buy Reward'}
                    </Button>
                </Card.Actions>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title style={styles.headerTitle}>Rewards Store 🛍️</Title>
                <Chip icon="star" style={styles.starsDisplay} textStyle={{ fontSize: 16, fontWeight: 'bold', color: '#F57F17' }}>{stars} Stars</Chip>
            </View>
            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} color="#FF7043" />
            ) : (
                <FlatList
                    data={rewards}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Paragraph>No rewards found yet.</Paragraph>
                            <Button onPress={() => require('../services/seeder').seedData()}>Load Rewards</Button>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF3E0', // Soft Orange
    },
    header: {
        padding: 20,
        paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        elevation: 4,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E65100',
    },
    starsDisplay: {
        backgroundColor: '#FFF8E1',
        borderColor: '#FFD700',
        borderWidth: 1,
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
    unlockedCard: {
        backgroundColor: '#E8F5E9', // Light Green
        opacity: 0.8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    costChip: {
        backgroundColor: '#FFF9C4',
    },
    unlockedChip: {
        backgroundColor: '#C8E6C9',
    },
});
