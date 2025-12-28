import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    // Using standard React Native Animated API
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Dynamic Background */}
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#312e81']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />

            {/* Decorative Orbs */}
            <View style={[styles.orb, { top: -100, left: -100, backgroundColor: '#4f46e5' }]} />
            <View style={[styles.orb, { bottom: 100, right: -100, backgroundColor: '#c026d3' }]} />

            <View style={styles.content}>

                {/* Header Section */}
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.iconContainer}>
                        <Sparkles color="#6366f1" size={32} />
                    </View>
                    <Text style={styles.title}>Digital Vidya Saarthi</Text>
                    <Text style={styles.subtitle}>Innovate. Automate. Educate.</Text>
                </Animated.View>

                {/* Illustration Placeholder */}
                <Animated.View style={[styles.illustration, { opacity: fadeAnim }]}>
                    <View style={styles.cardPreview}>
                        <LinearGradient colors={['#ffffff20', '#ffffff05']} style={styles.glassCard} />
                        <LinearGradient colors={['#ffffff20', '#ffffff05']} style={[styles.glassCard, styles.glassCardOffset]} />
                    </View>
                </Animated.View>

                {/* Bottom Section */}
                <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                        <Text style={styles.description}>
                            Experience the future of school management right in your pocket.
                        </Text>

                        <TouchableOpacity
                            style={styles.button}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('LoginSelection')}
                        >
                            <LinearGradient
                                colors={['#4f46e5', '#7c3aed']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>Get Started</Text>
                                <ArrowRight color="#fff" size={20} strokeWidth={2.5} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </BlurView>
                </Animated.View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    orb: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.2,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 24,
        paddingTop: 80,
    },
    header: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 18,
        color: '#94a3b8',
        fontWeight: '500',
        letterSpacing: 1,
    },
    illustration: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
    },
    cardPreview: {
        width: 200,
        height: 140,
        alignItems: 'center',
    },
    glassCard: {
        width: 220,
        height: 140,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        position: 'absolute',
    },
    glassCardOffset: {
        transform: [{ rotate: '-10deg' }, { translateY: -20 }],
        zIndex: -1,
        opacity: 0.6,
    },
    footer: {
        marginBottom: 40,
    },
    blurContainer: {
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    description: {
        color: '#cbd5e1',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    button: {
        width: '100%',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    gradientButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default HomeScreen;
