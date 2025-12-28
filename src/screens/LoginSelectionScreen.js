import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ShieldCheck, GraduationCap, User, Users, Briefcase, ArrowLeft } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const roles = [
    { key: 'admin', label: 'Admin', icon: ShieldCheck, color: ['#ef4444', '#b91c1c'] },
    { key: 'teacher', label: 'Teacher', icon: Briefcase, color: ['#f59e0b', '#d97706'] },
    { key: 'student', label: 'Student', icon: GraduationCap, color: ['#3b82f6', '#2563eb'] },
    { key: 'parent', label: 'Parent', icon: Users, color: ['#10b981', '#059669'] },
    { key: 'accountants', label: 'Accountant', icon: User, color: ['#8b5cf6', '#7c3aed'] },
    { key: 'receptionist', label: 'Receptionist', icon: User, color: ['#ec4899', '#db2777'] },
];

const LoginSelectionScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleSelect = (role) => {
        navigation.navigate('Login', { role });
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                style={styles.background}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Who are you?</Text>
                <Text style={styles.subtitle}>Select your profile type to continue</Text>
            </View>

            <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
                {roles.map((role, index) => (
                    <Animated.View
                        key={role.key}
                        style={{ opacity: fadeAnim }}
                    >
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.7}
                            onPress={() => handleSelect(role.key)}
                        >
                            <BlurView intensity={20} tint="light" style={styles.cardContent}>
                                <LinearGradient
                                    colors={role.color}
                                    style={styles.iconBox}
                                >
                                    <role.icon color="#fff" size={28} />
                                </LinearGradient>
                                <Text style={styles.cardTitle}>{role.label}</Text>
                                <Text style={styles.cardArrow}>→</Text>
                            </BlurView>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    header: {
        marginBottom: 30,
    },
    backButton: {
        marginBottom: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
    },
    grid: {
        paddingBottom: 40,
        gap: 16,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 8,
    },
    cardContent: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        flex: 1,
    },
    cardArrow: {
        fontSize: 24,
        color: 'rgba(255,255,255,0.3)',
        fontWeight: '300',
    },
});

export default LoginSelectionScreen;
