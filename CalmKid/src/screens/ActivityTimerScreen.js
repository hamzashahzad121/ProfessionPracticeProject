import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Vibration } from 'react-native';
import { Text, Button, Title, Paragraph, ProgressBar, Surface } from 'react-native-paper';
import { supabase } from '../services/supabase';

export default function ActivityTimerScreen({ route, navigation }) {
    const { activity } = route.params;
    const [secondsLeft, setSecondsLeft] = useState(activity.duration_minutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [progress, setProgress] = useState(0);
    const totalSeconds = activity.duration_minutes * 60;

    useEffect(() => {
        let interval = null;
        if (isActive && secondsLeft > 0) {
            interval = setInterval(() => {
                setSecondsLeft(seconds => seconds - 1);
                setProgress(1 - (secondsLeft - 1) / totalSeconds);
            }, 1000);
        } else if (secondsLeft === 0) {
            clearInterval(interval);
            setIsActive(false);
            setIsCompleted(true);
            Vibration.vibrate();
        }
        return () => clearInterval(interval);
    }, [isActive, secondsLeft]);

    async function claimReward() {
        // Save to DB
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error: logError } = await supabase
                .from('activity_logs')
                .insert([{ user_id: user.id, activity_id: activity.id }]);

            if (logError) {
                console.error("Error logging activity:", logError);
                Alert.alert("Error", "Could not save activity progress.");
                return;
            }

            // Update stars - Fetch latest first to be safe
            const { data: profile, error: profileError } = await supabase.from('profiles').select('stars').eq('id', user.id).single();

            if (profileError) {
                console.error("Error fetching profile for stars:", profileError);
            }

            const currentStars = profile?.stars || 0;
            const newStars = currentStars + activity.stars_reward;

            const { error: updateError } = await supabase.from('profiles').update({ stars: newStars }).eq('id', user.id);

            if (updateError) {
                console.error("Error updating stars:", updateError);
                Alert.alert("Error", "Could not update your stars.");
                return;
            }

            Alert.alert(
                "🌟 STARS EARNED! 🌟",
                `You did it! You earned ${activity.stars_reward} stars!\nTotal Stars: ${newStars}`,
                [{ text: "Awesome!", onPress: () => navigation.goBack() }]
            );
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: getCategoryColor(activity.category) }]}>
            <Surface style={styles.card}>
                <Title style={styles.title}>{activity.title}</Title>
                <Paragraph style={styles.desc}>{activity.description}</Paragraph>

                {!isCompleted ? (
                    <>
                        <View style={styles.timerContainer}>
                            <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
                        </View>
                        <ProgressBar progress={progress} color="#4CAF50" style={styles.progressBar} />

                        <View style={styles.controls}>
                            {!isActive ? (
                                <Button mode="contained" onPress={() => setIsActive(true)} style={styles.button} labelStyle={{ fontSize: 20 }}>
                                    {secondsLeft === totalSeconds ? "Start Timer" : "Resume"}
                                </Button>
                            ) : (
                                <Button mode="contained" onPress={() => setIsActive(false)} style={[styles.button, { backgroundColor: '#FF7043' }]}>
                                    Pause
                                </Button>
                            )}
                            <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                                Cancel
                            </Button>
                        </View>
                    </>
                ) : (
                    <View style={styles.completedContainer}>
                        <Text style={{ fontSize: 60 }}>🎉</Text>
                        <Title style={{ marginTop: 20, marginBottom: 10 }}>Activity Done!</Title>
                        <Paragraph style={{ marginBottom: 30 }}>Great job focusing on your task.</Paragraph>
                        <Button
                            mode="contained"
                            onPress={claimReward}
                            style={[styles.button, { backgroundColor: '#FFD700', paddingHorizontal: 50 }]}
                            labelStyle={{ color: '#333', fontWeight: 'bold', fontSize: 18 }}
                        >
                            Claim {activity.stars_reward} Stars!
                        </Button>
                    </View>
                )}
            </Surface>
        </View>
    );
}

function getCategoryColor(category) {
    switch (category) {
        case 'Breathing': return '#E1F5FE';
        case 'Focus': return '#F3E5F5';
        case 'Relaxation': return '#E8F5E9';
        case 'Creativity': return '#FFF3E0';
        default: return '#ECEFF1';
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        padding: 30,
        borderRadius: 30,
        elevation: 10,
        alignItems: 'center',
        backgroundColor: '#fff',
        minHeight: 400,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    desc: {
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
        fontSize: 16,
    },
    timerContainer: {
        marginBottom: 30,
        padding: 20,
        borderRadius: 100,
        borderWidth: 5,
        borderColor: '#FFD700',
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerText: {
        fontSize: 60,
        fontWeight: 'bold',
        color: '#333',
    },
    progressBar: {
        width: '100%',
        height: 15,
        borderRadius: 10,
        marginBottom: 30,
    },
    button: {
        borderRadius: 50,
        paddingVertical: 10,
        paddingHorizontal: 40,
        backgroundColor: '#4CAF50',
    },
    controls: {
        width: '100%',
        alignItems: 'center',
    },
    completedContainer: {
        alignItems: 'center',
        width: '100%',
    }
});
