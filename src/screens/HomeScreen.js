import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Menu } from 'lucide-react-native';
import { useTheme } from '../theme';
import ThemeToggle from '../components/ThemeToggle';
import NavDrawer from '../components/NavDrawer';
import { FeaturesView, AboutView, ContactView, DemoView } from '../components/content';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [activeView, setActiveView] = useState('home'); // 'home', 'features', 'about', 'contact', 'demo'

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance Animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleNavigation = (key) => {
        if (key === 'login') {
            navigation.navigate('LoginSelection');
        } else {
            setActiveView(key);
            // Trigger fade transition
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'features': return <FeaturesView />;
            case 'about': return <AboutView />;
            case 'contact': return <ContactView />;
            case 'demo': return <DemoView />;
            case 'home':
            default:
                return (
                    <View style={styles.content}>
                        {/* Header Section */}
                        <View style={styles.header}>
                            <Image
                                source={require('../assets/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <Text style={[styles.title, { color: theme.textPrimary }]}>Digital Vidya Saarthi</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Innovate. Automate. Educate.</Text>
                        </View>

                        {/* Raw Hero Image - Static */}
                        <View style={styles.illustration}>
                            <Image
                                source={require('../assets/home-hero.png')}
                                style={styles.heroImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Bottom Section */}
                        <View style={styles.footer}>
                            <BlurView intensity={isDarkMode ? 30 : 60} tint={isDarkMode ? "dark" : "light"} style={[styles.blurContainer, { borderColor: theme.surfaceBorder }]}>
                                <Text style={[styles.description, { color: theme.textSecondary }]}>
                                    Experience the future of school management right in your pocket.
                                </Text>

                                <TouchableOpacity
                                    style={styles.button}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate('LoginSelection')}
                                >
                                    <LinearGradient
                                        colors={[theme.gradientStart, theme.gradientEnd]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.gradientButton}
                                    >
                                        <Text style={styles.buttonText}>Get Started</Text>
                                        <ArrowRight color="#fff" size={20} strokeWidth={2.5} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </BlurView>
                        </View>
                    </View>
                );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            {/* Dynamic Background */}
            <LinearGradient
                colors={isDarkMode ? ['#0f172a', '#1e1b4b', '#312e81'] : ['#f8fafc', '#e0e7ff', '#c7d2fe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />

            {/* Decorative Orbs */}
            <View style={[styles.orb, { top: -100, left: -100, backgroundColor: theme.orbPrimary }]} />
            <View style={[styles.orb, { bottom: 100, right: -100, backgroundColor: theme.orbSecondary }]} />

            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                    onPress={() => setDrawerVisible(true)}
                >
                    <Menu color={theme.textPrimary} size={22} />
                </TouchableOpacity>
                <ThemeToggle />
            </View>

            {/* Dynamic Content */}
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                {activeView === 'home' ? (
                    renderContent()
                ) : (
                    <View style={styles.innerContentContainer}>
                        {renderContent()}
                    </View>
                )}
            </Animated.View>

            {/* Navigation Drawer */}
            <NavDrawer
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                onNavigate={handleNavigation}
                navigation={navigation}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 50,
        zIndex: 100,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 24,
        paddingTop: 10,
    },
    innerContentContainer: {
        flex: 1,
        paddingTop: 10,
    },
    header: {
        alignItems: 'center',
        marginTop: -60,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 1,
    },
    illustration: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 380,
    },
    heroImage: {
        width: 360,
        height: 360,
    },
    footer: {
        marginBottom: 30,
    },
    blurContainer: {
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    description: {
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
