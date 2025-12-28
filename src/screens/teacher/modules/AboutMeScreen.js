import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { Mail, Phone, MapPin, Calendar, Clock, BookOpen, User, Briefcase, Award, Hash, DollarSign } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AboutMeScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('userInfo');
                if (storedUser) {
                    setUserData(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to load user profile", error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.textSecondary }}>Failed to load profile.</Text>
            </View>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const InfoRow = ({ icon: Icon, label, value, isLink, onPress, iconColor }) => (
        <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: (iconColor || theme.primary) + '15' }]}>
                <Icon size={18} color={iconColor || theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
                {isLink ? (
                    <TouchableOpacity onPress={onPress}>
                        <Text style={[styles.infoValue, { color: theme.primary, textDecorationLine: 'underline' }]}>
                            {value || 'N/A'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{value || 'N/A'}</Text>
                )}
            </View>
        </View>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
            {/* Header / Profile Card */}
            <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.shadow, marginTop: 16 }]}>
                {/* Banner Gradient */}
                <LinearGradient
                    colors={['#4f46e5', '#7c3aed']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.avatarContainer}>
                            {userData.image && userData.image.url ? (
                                <Image source={{ uri: userData.image.url }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.placeholderAvatar]}>
                                    <User size={40} color="#fff" />
                                </View>
                            )}
                            <View style={styles.statusBadge}>
                                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                            </View>
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.name}>{userData.fullName}</Text>
                            <Text style={styles.role}>{userData.subject}</Text>
                            <View style={styles.statusPill}>
                                <Text style={styles.statusText}>{userData.status || 'Active'}</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Quick Contact */}
                <View style={styles.quickContact}>
                    <TouchableOpacity
                        style={[styles.contactItem, { borderColor: theme.border }]}
                        onPress={() => Linking.openURL(`tel:+91${userData.contact}`)}
                    >
                        <Phone size={16} color={theme.textSecondary} />
                        <Text style={[styles.contactText, { color: theme.textSecondary }]}>+91 {userData.contact}</Text>
                    </TouchableOpacity>
                    <View style={[styles.contactItem, { borderColor: theme.border, borderLeftWidth: 1, borderRightWidth: 0, borderTopWidth: 0, borderBottomWidth: 0, borderRadius: 0 }]}>
                        <MapPin size={16} color={theme.textSecondary} />
                        <Text style={[styles.contactText, { color: theme.textSecondary }]} numberOfLines={1}>{userData.address}</Text>
                    </View>
                </View>
            </View>

            {/* Professional Details Section */}
            <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>Professional Details</Text>

            <View style={styles.grid}>
                {/* Personal Info Card */}
                <View style={[styles.gridCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Personal Information</Text>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <InfoRow icon={Hash} label="Employee ID" value={userData.employeeId} iconColor="#3b82f6" />
                    <InfoRow
                        icon={Mail}
                        label="Email"
                        value={userData.email}
                        isLink
                        onPress={() => Linking.openURL(`mailto:${userData.email}`)}
                        iconColor="#ea580c"
                    />
                    <InfoRow icon={User} label="Gender" value={userData.gender} iconColor="#8b5cf6" />
                    <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(userData.dateOfBirth)} iconColor="#ec4899" />
                </View>

                {/* Work Info Card */}
                <View style={[styles.gridCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Work Information</Text>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <InfoRow icon={Award} label="Qualification" value={userData.qualification} iconColor="#10b981" />
                    <InfoRow icon={BookOpen} label="Subject" value={userData.subject} iconColor="#f59e0b" />
                    <InfoRow icon={Briefcase} label="Class Teacher" value={`${userData.classTeacher || 'N/A'} - ${userData.section || ''}`} iconColor="#6366f1" />
                    <InfoRow icon={Clock} label="Experience" value={`${userData.experience} Years`} iconColor="#14b8a6" />
                </View>
            </View>

            {/* Salary Card */}
            <View style={[styles.salaryCard, { backgroundColor: isDarkMode ? '#064e3b' : '#ecfdf5', borderColor: isDarkMode ? '#065f46' : '#a7f3d0' }]}>
                <View style={styles.salaryHeader}>
                    <View style={[styles.salaryIconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#d1fae5' }]}>
                        <DollarSign size={24} color="#10b981" />
                    </View>
                    <View>
                        <Text style={[styles.salaryTitle, { color: isDarkMode ? '#a7f3d0' : '#047857' }]}>Monthly Salary</Text>
                        <Text style={[styles.salarySubtitle, { color: isDarkMode ? '#6ee7b7' : '#059669' }]}>Current compensation</Text>
                    </View>
                </View>
                <Text style={[styles.salaryAmount, { color: isDarkMode ? '#fff' : '#059669' }]}>
                    ₹{userData.salary?.toLocaleString() || 'N/A'}
                    <Text style={{ fontSize: 14, fontWeight: 'normal', color: isDarkMode ? '#a7f3d0' : '#059669' }}> / month</Text>
                </Text>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        marginBottom: 24,
    },
    headerGradient: {
        padding: 24,
        paddingTop: 32,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    placeholderAvatar: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
    },
    headerText: {
        flex: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    role: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 8,
    },
    statusPill: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    quickContact: {
        flexDirection: 'row',
        padding: 16,
    },
    contactItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    contactText: {
        fontSize: 13,
        fontWeight: '500',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        marginLeft: 4,
    },
    grid: {
        gap: 16,
    },
    gridCard: {
        borderRadius: 16,
        padding: 20,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    salaryCard: {
        marginTop: 24,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
    },
    salaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
    },
    salaryIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    salaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    salarySubtitle: {
        fontSize: 13,
    },
    salaryAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'right',
    },
});

export default AboutMeScreen;
