import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, LayoutDashboard, Users, CalendarCheck, FileText, GraduationCap, Video, BookOpen, Layers, DollarSign, Cpu, User, LogOut, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const menuItems = [
    { key: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'MyStudents', label: 'My Students', icon: Users },
    { key: 'Attendance', label: 'Attendance', icon: CalendarCheck },
    { key: 'AssignmentsList', label: 'Assignments', icon: FileText },
    { key: 'Exams', label: 'Exams & Results', icon: GraduationCap },
    { key: 'Lectures', label: 'Lectures', icon: Video },
    { key: 'Study', label: 'Study Material', icon: BookOpen },
    { key: 'Curriculum', label: 'Curriculum', icon: Layers },
    { key: 'Payroll', label: 'Payroll', icon: DollarSign },
    { key: 'AIFeatures', label: 'AI Hub', icon: Cpu },
    { key: 'AboutMe', label: 'My Profile', icon: User },
];

const TeacherSidebar = ({ visible, onClose, onNavigate, activeRoute }) => {
    const { theme, isDarkMode } = useTheme();
    const { logout } = useAuth();

    // Animations
    const slideAnim = useRef(new Animated.Value(-width)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: -width, duration: 300, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    const handleNavigation = (route) => {
        onClose();
        setTimeout(() => onNavigate(route), 200);
    };

    const handleLogout = () => {
        onClose();
        setTimeout(() => logout(), 200);
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
                </Animated.View>

                <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }], backgroundColor: theme.background }]}>
                    <SafeAreaView style={{ flex: 1 }}>

                        {/* Header */}
                        <View style={[styles.header, { borderBottomColor: theme.surfaceBorder }]}>
                            <View style={styles.userInfo}>
                                <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.avatar}>
                                    <User color="#fff" size={24} />
                                </LinearGradient>
                                <View>
                                    <Text style={[styles.userName, { color: theme.textPrimary }]}>Teacher Account</Text>
                                    <Text style={[styles.userRole, { color: theme.textSecondary }]}>Faculty Member</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.surface }]}>
                                <X size={20} color={theme.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* Menu */}
                        <ScrollView contentContainerStyle={styles.menuContainer} showsVerticalScrollIndicator={false}>
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeRoute === item.key;
                                return (
                                    <TouchableOpacity
                                        key={item.key}
                                        style={[
                                            styles.menuItem,
                                            isActive && { backgroundColor: theme.primary + '15' }
                                        ]}
                                        onPress={() => handleNavigation(item.key)}
                                    >
                                        <View style={[styles.iconBox, isActive && { backgroundColor: theme.primary }]}>
                                            <Icon size={20} color={isActive ? '#fff' : theme.textSecondary} />
                                        </View>
                                        <Text style={[
                                            styles.menuText,
                                            { color: isActive ? theme.primary : theme.textPrimary, fontWeight: isActive ? '700' : '500' }
                                        ]}>
                                            {item.label}
                                        </Text>
                                        {isActive && <ChevronRight size={16} color={theme.primary} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Footer */}
                        <View style={[styles.footer, { borderTopColor: theme.surfaceBorder }]}>
                            <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.error + '15' }]} onPress={handleLogout}>
                                <LogOut size={20} color={theme.error} />
                                <Text style={[styles.logoutText, { color: theme.error }]}>Logout</Text>
                            </TouchableOpacity>
                        </View>

                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1 },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sidebar: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0,
        width: width * 0.8,
        maxWidth: 320,
        shadowColor: "#000",
        shadowOffset: { width: 10, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 20,
    },
    header: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userRole: {
        fontSize: 12,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuContainer: {
        padding: 16,
        gap: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    menuText: {
        fontSize: 15,
        flex: 1,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TeacherSidebar;
