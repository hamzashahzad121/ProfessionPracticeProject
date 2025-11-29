import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar, Title, Paragraph } from 'react-native-paper';
import { supabase } from '../services/supabase';
import { seedData } from '../services/seeder';

export default function ProfileScreen({ navigation }) {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setProfile(data);
        }
    }

    async function signOut() {
        await supabase.auth.signOut();
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text size={80} label={profile?.name?.substring(0, 2) || 'CK'} style={styles.avatar} />
                <Title style={styles.name}>{profile?.name || 'Kiddo'}</Title>
                <Paragraph>Age: {profile?.age || 7}</Paragraph>
            </View>

            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <Title>{profile?.stars || 0}</Title>
                    <Paragraph>Stars</Paragraph>
                </View>
            </View>

            <Button mode="contained" onPress={signOut} style={styles.button}>Sign Out</Button>

            <Button
                mode="text"
                onPress={seedData}
                style={{ marginTop: 20 }}
                labelStyle={{ color: '#888', fontSize: 10 }}
            >
                (Debug) Load Default Data
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    avatar: {
        backgroundColor: '#4a90e2',
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 40,
    },
    statItem: {
        alignItems: 'center',
    },
    button: {
        width: '100%',
        backgroundColor: '#ff6347',
    },
});
