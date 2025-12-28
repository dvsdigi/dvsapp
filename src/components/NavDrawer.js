import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Home, Sparkles, Info, Phone, LogIn, ChevronRight, PlayCircle } from 'lucide-react-native';
import { useTheme } from '../theme';

const { width } = Dimensions.get('window');

const menuItems = [
    { key: 'home', label: 'Home', icon: Home, description: 'Back to main screen' },
    { key: 'features', label: 'Features', icon: Sparkles, description: 'Explore what we offer' },
    { key: 'about', label: 'About Us', icon: Info, description: 'Learn our story' },
    { key: 'contact', label: 'Contact', icon: Phone, description: 'Get in touch' },
    { key: 'demo', label: 'Product Demo', icon: PlayCircle, description: 'Watch it in action' },
    { key: 'login', label: 'Login', icon: LogIn, description: 'Access your account' },
];

const NavDrawer = ({ visible, onClose, onNavigate, navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const slideAnim = useRef(new Animated.Value(-width)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const itemAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        if (visible) {
            // Slide in drawer
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 10,
                    tension: 40,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Stagger menu items
            itemAnims.forEach((anim, i) => {
                Animated.spring(anim, {
                    toValue: 1,
                    useNativeDriver: true,
                    delay: i * 50 + 200,
                    friction: 8,
                }).start();
            });
        } else {
            // Reset animations
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -width,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            itemAnims.forEach(anim => anim.setValue(0));
        }
    }, [visible]);

    const handleItemPress = (key) => {
        onClose();
        setTimeout(() => {
            if (key === 'login') {
                navigation?.navigate('LoginSelection');
            } else if (onNavigate) {
                onNavigate(key);
            }
        }, 300);
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
                </Animated.View>

                {/* Drawer */}
                <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
                    <LinearGradient
                        colors={isDarkMode ? ['#0f172a', '#1e1b4b'] : ['#ffffff', '#f1f5f9']}
                        style={StyleSheet.absoluteFill}
                    />

                    <SafeAreaView style={styles.drawerContent}>
                        {/* Header */}
                        <View style={styles.drawerHeader}>
                            <View style={styles.headerLeft}>
                                <View style={[styles.logoMini, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.1)' }]}>
                                    <Image
                                        source={require('../assets/logo.png')}
                                        style={styles.logoImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View>
                                    <Text style={[styles.brandName, { color: theme.textPrimary }]}>DVS</Text>
                                    <Text style={[styles.brandTag, { color: theme.textMuted }]}>Mobile</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                style={[styles.closeButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                            >
                                <X color={theme.textPrimary} size={20} />
                            </TouchableOpacity>
                        </View>

                        {/* Menu List */}
                        <View style={styles.menuList}>
                            {menuItems.map((item, index) => {
                                const IconComponent = item.icon;
                                return (
                                    <Animated.View
                                        key={item.key}
                                        style={{
                                            opacity: itemAnims[index],
                                            transform: [{
                                                translateX: itemAnims[index].interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-30, 0],
                                                })
                                            }]
                                        }}
                                    >
                                        <TouchableOpacity
                                            style={[styles.menuItem, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                                            onPress={() => handleItemPress(item.key)}
                                            activeOpacity={0.7}
                                        >
                                            <LinearGradient
                                                colors={item.key === 'login' ? ['#4f46e5', '#7c3aed'] : [theme.primary + '30', theme.primary + '10']}
                                                style={[styles.menuIconBox, item.key === 'login' && styles.loginIconBox]}
                                            >
                                                <IconComponent color={item.key === 'login' ? '#fff' : theme.primary} size={20} />
                                            </LinearGradient>
                                            <View style={styles.menuTextContainer}>
                                                <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                                                <Text style={[styles.menuDescription, { color: theme.textMuted }]}>{item.description}</Text>
                                            </View>
                                            <ChevronRight color={theme.textMuted} size={18} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })}
                        </View>

                        {/* Footer */}
                        <View style={[styles.drawerFooter, { borderTopColor: theme.surfaceBorder }]}>
                            <Text style={[styles.footerText, { color: theme.textMuted }]}>Digital Vidya Saarthi © 2025</Text>
                        </View>
                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    drawer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: width * 0.85,
        maxWidth: 360,
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 25,
    },
    drawerContent: {
        flex: 1,
        paddingTop: 10,
    },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginBottom: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoMini: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: 32,
        height: 32,
    },
    brandName: {
        fontSize: 20,
        fontWeight: '800',
    },
    brandTag: {
        fontSize: 12,
        fontWeight: '500',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuList: {
        flex: 1,
        paddingHorizontal: 16,
        gap: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        gap: 14,
    },
    menuIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginIconBox: {
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    menuDescription: {
        fontSize: 12,
        marginTop: 2,
    },
    drawerFooter: {
        padding: 20,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
    },
});

export default NavDrawer;
