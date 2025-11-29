import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Title, Paragraph, Avatar } from 'react-native-paper';
import { supabase } from '../services/supabase';

export default function SetupProfileScreen({ navigation, route }) {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [region, setRegion] = useState('');
    const [school, setSchool] = useState('');
    const [loading, setLoading] = useState(false);

    // If coming from Home, we might want to go back, but usually this is a blocking step
    // so we reset navigation or just go to Main

    async function saveProfile() {
        if (!name || !age || !region || !school) {
            Alert.alert('Please fill all fields', 'We need to know a bit about you!');
            return;
        }

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        const updates = {
            id: user.id,
            name,
            age: parseInt(age),
            region,
            school,
            stars: 0, // Initialize stars
            updated_at: new Date(),
        };

        const { error } = await supabase
            .from('profiles')
            .upsert(updates);

        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            // Navigate to Main Tabs
            // We assume this screen is part of a stack that can navigate to 'Main' or 'Home'
            // If used in the Auth flow, we might need to trigger a state update in App.js
            // For now, let's assume we can navigate to 'Main' if it's registered, or just go back
            if (route.params?.onComplete) {
                route.params.onComplete();
            } else {
                // Fallback if used differently
                Alert.alert('Success!', 'Profile setup complete.');
            }
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.title}>Welcome to CalmKid! 🌟</Title>
            <Paragraph style={styles.subtitle}>Let's set up your profile.</Paragraph>

            <View style={styles.inputContainer}>
                <TextInput
                    label="What is your name?"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    theme={{ colors: { primary: '#FF9800' } }}
                />
                <TextInput
                    label="How old are you?"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                    theme={{ colors: { primary: '#4CAF50' } }}
                />
                <TextInput
                    label="Which country/region are you from?"
                    value={region}
                    onChangeText={setRegion}
                    mode="outlined"
                    style={styles.input}
                    theme={{ colors: { primary: '#2196F3' } }}
                />
                <TextInput
                    label="What is your school's name?"
                    value={school}
                    onChangeText={setSchool}
                    mode="outlined"
                    style={styles.input}
                    theme={{ colors: { primary: '#9C27B0' } }}
                />
            </View>

            <Button
                mode="contained"
                onPress={saveProfile}
                loading={loading}
                style={styles.button}
                labelStyle={{ fontSize: 18, padding: 5 }}
            >
                Start My Journey! 🚀
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#FFF3E0', // Soft Orange background
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FF6F00',
        marginBottom: 10,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
        fontSize: 16,
        color: '#555',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#FF9800',
        borderRadius: 30,
        elevation: 5,
    },
});
