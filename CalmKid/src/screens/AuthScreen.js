import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Title } from 'react-native-paper';
import { supabase } from '../services/supabase';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) Alert.alert(error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            Alert.alert(error.message);
        } else {
            if (user && age) {
                const parsedAge = parseInt(age);
                if (!isNaN(parsedAge)) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: user.id,
                            age: parsedAge,
                            updated_at: new Date()
                        });

                    if (profileError) console.log('Profile error:', profileError);
                }
            }
            Alert.alert('Check your email for the login link!');
        }
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Welcome to CalmKid</Title>
            <View style={styles.inputContainer}>
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    autoCapitalize="none"
                    mode="outlined"
                    style={styles.input}
                />
                <TextInput
                    label="Age (for Sign Up)"
                    value={age}
                    onChangeText={(text) => setAge(text)}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                />
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    mode="outlined"
                    style={styles.input}
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button mode="contained" onPress={signInWithEmail} loading={loading} style={styles.button}>
                    Sign In
                </Button>
                <Button mode="outlined" onPress={signUpWithEmail} loading={loading} style={styles.button}>
                    Sign Up
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f0f4f8',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#4a90e2',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        marginBottom: 10,
    },
    buttonContainer: {
        gap: 10,
    },
    button: {
        paddingVertical: 5,
    },
});
