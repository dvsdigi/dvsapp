import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, UserCircle, Key } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation, route }) => {
    const { role } = route.params;
    const { login, isLoading } = useAuth();
    const { theme, isDarkMode } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [session, setSession] = useState('2025-2026');
    const [showPassword, setShowPassword] = useState(false);

    const getRoleColor = () => {
        switch (role) {
            case 'admin': return ['#ef4444', '#b91c1c'];
            case 'teacher': return ['#f59e0b', '#d97706'];
            case 'student': return ['#3b82f6', '#2563eb'];
            case 'parent': return ['#10b981', '#059669'];
            case 'thirdparty': return ['#64748b', '#475569'];
            default: return ['#8b5cf6', '#7c3aed'];
        }
    };
    const roleColors = getRoleColor();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        const result = await login(role, email, password, session);
        if (!result.success) {
            Alert.alert('Login Failed', result.message);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Dynamic Background */}
            <LinearGradient
                colors={isDarkMode ? ['#000000', '#111827', '#1f2937'] : roleColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />

            {/* Glass Overlay Circle */}
            <View style={[styles.circle, { borderColor: 'rgba(255,255,255,0.1)' }]} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, justifyContent: 'center' }}
            >
                <View style={styles.contentContainer}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <ArrowLeft color="#fff" size={24} />
                        </TouchableOpacity>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        <Text style={styles.roleText}>{role.charAt(0).toUpperCase() + role.slice(1)} Login</Text>
                    </View>

                    {/* Glass Form Card */}
                    <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={styles.glassCard}>

                        {/* Avatar */}
                        <View style={[styles.avatarContainer, { shadowColor: roleColors[0] }]}>
                            <LinearGradient colors={roleColors} style={styles.avatar}>
                                <UserCircle color="#fff" size={40} />
                            </LinearGradient>
                        </View>

                        <View style={styles.form}>
                            {/* Session (Admin Only) */}
                            {role === 'admin' && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Session</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={[styles.input, { color: '#fff' }]}
                                            value={session}
                                            editable={false}
                                        />
                                    </View>
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email / Username</Text>
                                <View style={styles.inputWrapper}>
                                    <Mail color="rgba(255,255,255,0.6)" size={20} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your ID"
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.inputWrapper}>
                                    <Key color="rgba(255,255,255,0.6)" size={20} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter password"
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff color="rgba(255,255,255,0.6)" size={20} /> : <Eye color="rgba(255,255,255,0.6)" size={20} />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.loginBtn}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={roleColors}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.btnGradient}
                                >
                                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login Now</Text>}
                                </LinearGradient>
                            </TouchableOpacity>

                        </View>
                    </BlurView>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    circle: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        borderWidth: 2,
        opacity: 0.2,
    },
    contentContainer: {
        padding: 24,
    },
    header: {
        marginBottom: 30, // Increased margin to prevent overlap
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.5,
    },
    roleText: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    glassCard: {
        borderRadius: 30,
        padding: 24,
        paddingTop: 40,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.3)', // Fallback / Shade
    },
    avatarContainer: {
        position: 'absolute',
        top: -30,
        left: 24,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    form: {
        marginTop: 10,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        height: '100%',
    },
    loginBtn: {
        marginTop: 10,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    btnGradient: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default LoginScreen;
