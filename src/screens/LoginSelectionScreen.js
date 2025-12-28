import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, StatusBar as RNStatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ShieldCheck, GraduationCap, User, Users, Briefcase, ArrowLeft, Calculator, ClipboardList, Globe } from 'lucide-react-native';
import { useTheme } from '../theme';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = 80; // Reduced from 100
const ITEM_MARGIN = 12; // Reduced from 16
const FULL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN;

const roles = [
    { key: 'admin', label: 'Admin', icon: ShieldCheck, color: ['#ef4444', '#b91c1c'], desc: 'School Administrator' },
    { key: 'teacher', label: 'Teacher', icon: Briefcase, color: ['#f59e0b', '#d97706'], desc: 'Faculty Member' },
    { key: 'student', label: 'Student', icon: GraduationCap, color: ['#3b82f6', '#2563eb'], desc: 'Learning Portal' },
    { key: 'parent', label: 'Parent', icon: Users, color: ['#10b981', '#059669'], desc: 'Guardian Access' },
    { key: 'accountants', label: 'Accountant', icon: Calculator, color: ['#8b5cf6', '#7c3aed'], desc: 'Finance Management' },
    { key: 'receptionist', label: 'Receptionist', icon: ClipboardList, color: ['#ec4899', '#db2777'], desc: 'Front Desk' },
    { key: 'thirdparty', label: 'Third Party', icon: Globe, color: ['#64748b', '#475569'], desc: 'External Vendor' },
];

const LoginSelectionScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const scrollY = useRef(new Animated.Value(0)).current;

    const handleSelect = (role) => {
        navigation.navigate('Login', { role });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            {/* Ambient Background */}
            <LinearGradient
                colors={isDarkMode ? ['#0f172a', '#1e1b4b', '#000000'] : ['#f1f5f9', '#e0e7ff', '#ffffff']}
                style={styles.background}
            />
            {/* Decorative Blobs */}
            <View style={[styles.blob, { backgroundColor: theme.primary, top: -100, right: -100, opacity: 0.15 }]} />
            <View style={[styles.blob, { backgroundColor: theme.secondary, bottom: -100, left: -100, opacity: 0.15 }]} />

            {/* Header */}
            <SafeAreaWrapper>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.surface }]}>
                        <ArrowLeft color={theme.textPrimary} size={24} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>Select Profile</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Choose your role to continue</Text>
                    </View>
                </View>
            </SafeAreaWrapper>

            {/* Role List */}
            <Animated.FlatList
                data={roles}
                keyExtractor={item => item.key}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                renderItem={({ item, index }) => {
                    const inputRange = [
                        -1,
                        0,
                        ITEM_HEIGHT * index,
                        ITEM_HEIGHT * (index + 2)
                    ];

                    const scale = scrollY.interpolate({
                        inputRange,
                        outputRange: [1, 1, 1, 0.9]
                    });

                    const opacity = scrollY.interpolate({
                        inputRange,
                        outputRange: [1, 1, 1, 0.5]
                    });

                    const IconComponent = item.icon;

                    return (
                        <Animated.View style={{ transform: [{ scale }], opacity }}>
                            <TouchableOpacity
                                style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                                onPress={() => handleSelect(item.key)}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={item.color}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.iconBox}
                                >
                                    <IconComponent color="#fff" size={28} />
                                </LinearGradient>

                                <View style={styles.cardContent}>
                                    <Text style={[styles.roleLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                                    <Text style={[styles.roleDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                                </View>

                                <View style={[styles.arrowBox, { backgroundColor: theme.backgroundSecondary }]}>
                                    <ArrowLeft style={{ transform: [{ rotate: '180deg' }] }} size={20} color={theme.textMuted} />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                }}
            />
        </View>
    );
};

const SafeAreaWrapper = ({ children }) => (
    <View style={{ paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight + 20 : 60, paddingHorizontal: 24 }}>
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    blob: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        blurRadius: 100, // Note: blurRadius specific to Image, simple View won't blur like CSS. 
        // For Expo Go compatibility without complex blur libraries, we rely on opacity.
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        gap: 20,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        height: ITEM_HEIGHT,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
        marginBottom: 16,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    cardContent: {
        flex: 1,
        marginLeft: 16,
    },
    roleLabel: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    roleDesc: {
        fontSize: 14,
        opacity: 0.7,
    },
    arrowBox: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default LoginSelectionScreen;
