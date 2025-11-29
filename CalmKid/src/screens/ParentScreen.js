import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Text, TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../services/supabase';

export default function ParentScreen() {
    const [pin, setPin] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [view, setView] = useState('menu'); // menu, journal, triggers, report, tips
    const [journalNote, setJournalNote] = useState('');
    const [logs, setLogs] = useState([]);
    const [triggers, setTriggers] = useState([]);
    const [selectedTriggers, setSelectedTriggers] = useState([]);

    const screenWidth = Dimensions.get('window').width;

    const commonTriggers = ['Hunger', 'Tiredness', 'Screen Time', 'Fights', 'Homework', 'Loud Noise'];

    useEffect(() => {
        if (isAuthenticated) {
            fetchLogs();
            fetchTriggers();
        }
    }, [isAuthenticated]);

    async function fetchLogs() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('behavior_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setLogs(data);
    }

    async function fetchTriggers() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('triggers').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setTriggers(data);
    }

    function checkPin() {
        if (pin === '1234') {
            setIsAuthenticated(true);
        } else {
            Alert.alert('Wrong PIN', 'Try 1234');
        }
    }

    async function saveJournal() {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('behavior_logs').insert([{ user_id: user.id, note: journalNote, severity: 'Medium' }]);
        setJournalNote('');
        fetchLogs();
        Alert.alert('Saved', 'Journal entry added.');
    }

    async function saveTriggers() {
        const { data: { user } } = await supabase.auth.getUser();
        const inserts = selectedTriggers.map(t => ({ user_id: user.id, trigger_name: t }));
        await supabase.from('triggers').insert(inserts);
        setSelectedTriggers([]);
        fetchTriggers();
        Alert.alert('Saved', 'Triggers logged.');
    }

    const toggleTrigger = (t) => {
        if (selectedTriggers.includes(t)) {
            setSelectedTriggers(selectedTriggers.filter(item => item !== t));
        } else {
            setSelectedTriggers([...selectedTriggers, t]);
        }
    };

    if (!isAuthenticated) {
        return (
            <View style={styles.centerContainer}>
                <Title>Parent Access</Title>
                <TextInput
                    label="Enter PIN (1234)"
                    value={pin}
                    onChangeText={setPin}
                    secureTextEntry
                    keyboardType="numeric"
                    style={styles.input}
                />
                <Button mode="contained" onPress={checkPin}>Unlock</Button>
            </View>
        );
    }

    if (view === 'menu') {
        return (
            <ScrollView style={styles.container}>
                <Title style={styles.header}>Parent Dashboard</Title>
                <View style={styles.menuGrid}>
                    <Card style={styles.menuCard} onPress={() => setView('journal')}>
                        <Card.Content><Title>📖 Journal</Title><Paragraph>Log behavior notes</Paragraph></Card.Content>
                    </Card>
                    <Card style={styles.menuCard} onPress={() => setView('triggers')}>
                        <Card.Content><Title>⚡ Triggers</Title><Paragraph>Log aggression triggers</Paragraph></Card.Content>
                    </Card>
                    <Card style={styles.menuCard} onPress={() => setView('report')}>
                        <Card.Content><Title>📊 Reports</Title><Paragraph>View progress charts</Paragraph></Card.Content>
                    </Card>
                    <Card style={styles.menuCard} onPress={() => setView('tips')}>
                        <Card.Content><Title>💡 Parenting Tips</Title><Paragraph>Helpful articles</Paragraph></Card.Content>
                    </Card>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Button icon="arrow-left" onPress={() => setView('menu')} style={styles.backButton}>Back to Menu</Button>

            {view === 'journal' && (
                <View>
                    <Title>Behavior Journal</Title>
                    <TextInput
                        label="What happened today?"
                        value={journalNote}
                        onChangeText={setJournalNote}
                        multiline
                        numberOfLines={4}
                        style={styles.input}
                    />
                    <Button mode="contained" onPress={saveJournal}>Save Entry</Button>

                    <Title style={{ marginTop: 20 }}>History</Title>
                    {logs.map((log) => (
                        <Card key={log.id} style={styles.logCard}>
                            <Card.Content>
                                <Paragraph>{new Date(log.created_at).toLocaleDateString()}</Paragraph>
                                <Paragraph>{log.note}</Paragraph>
                            </Card.Content>
                        </Card>
                    ))}
                </View>
            )}

            {view === 'triggers' && (
                <View>
                    <Title>Log Triggers</Title>
                    <View style={styles.triggerGrid}>
                        {commonTriggers.map(t => (
                            <Button
                                key={t}
                                mode={selectedTriggers.includes(t) ? "contained" : "outlined"}
                                onPress={() => toggleTrigger(t)}
                                style={styles.triggerButton}
                            >
                                {t}
                            </Button>
                        ))}
                    </View>
                    <Button mode="contained" onPress={saveTriggers} style={{ marginTop: 10 }}>Save Triggers</Button>

                    <Title style={{ marginTop: 20 }}>Recent Triggers</Title>
                    {triggers.slice(0, 5).map((t) => (
                        <Paragraph key={t.id}>{new Date(t.created_at).toLocaleDateString()} - {t.trigger_name}</Paragraph>
                    ))}
                </View>
            )}

            {view === 'report' && (
                <View>
                    <Title>Weekly Progress</Title>
                    <Paragraph>Mood Stability (Mock Data)</Paragraph>
                    <LineChart
                        data={{
                            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                            datasets: [{ data: [3, 4, 2, 5, 4, 4, 5] }]
                        }}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={{
                            backgroundColor: "#e26a00",
                            backgroundGradientFrom: "#fb8c00",
                            backgroundGradientTo: "#ffa726",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        }}
                        style={{ borderRadius: 16, marginVertical: 8 }}
                    />
                    <Card>
                        <Card.Content>
                            <Title>Summary</Title>
                            <Paragraph>Most common trigger: Hunger</Paragraph>
                            <Paragraph>Total Stars Earned: 45</Paragraph>
                        </Card.Content>
                    </Card>
                </View>
            )}

            {view === 'tips' && (
                <View>
                    <Title>Parenting Tips</Title>
                    <Card style={styles.menuCard}>
                        <Card.Content>
                            <Title>Handling Aggression</Title>
                            <Paragraph>Stay calm. Your child mirrors your emotions. Take a deep breath before responding.</Paragraph>
                        </Card.Content>
                    </Card>
                    <Card style={styles.menuCard}>
                        <Card.Content>
                            <Title>Anxiety Relief</Title>
                            <Paragraph>Create a worry box. Let your child write down worries and put them away.</Paragraph>
                        </Card.Content>
                    </Card>
                    <Card style={styles.menuCard}>
                        <Card.Content>
                            <Title>Improving Focus</Title>
                            <Paragraph>Break tasks into small chunks. Use a timer for short focus bursts.</Paragraph>
                        </Card.Content>
                    </Card>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f0f4f8' },
    centerContainer: { flex: 1, justifyContent: 'center', padding: 20 },
    header: { textAlign: 'center', marginBottom: 20 },
    input: { marginBottom: 10, backgroundColor: '#fff' },
    menuGrid: { gap: 10 },
    menuCard: { marginBottom: 10 },
    backButton: { alignSelf: 'flex-start', marginBottom: 10 },
    logCard: { marginBottom: 10, backgroundColor: '#fff' },
    triggerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    triggerButton: { marginBottom: 5 },
});
