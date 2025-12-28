import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../theme';
import { teacherApi } from '../../../api/teacherApi';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Book, Clock, AlertCircle, Trash2, Plus } from 'lucide-react-native';

const ExamsScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([]);
    const [stats, setStats] = useState({ total: 0, upcoming: 0, active: 0, completed: 0 });

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('userInfo');
            if (!storedUser) return;

            const user = JSON.parse(storedUser);
            console.log("ExamsScreen: User Info:", user);

            if (user.classTeacher && user.section) {
                console.log(`ExamsScreen: Fetching exams for Class ${user.classTeacher} Section ${user.section}`);
                const response = await teacherApi.getExams(user.classTeacher, user.section);
                console.log("ExamsScreen: Raw API Response:", JSON.stringify(response));

                if (response && response.success) {
                    console.log("ExamsScreen: Processing exams...", response.exams?.length);
                    processExams(response.exams || []);
                } else {
                    console.error("ExamsScreen: API returned success=false or invalid response");
                }
            } else {
                console.warn("ExamsScreen: Missing class/section in user info");
            }
        } catch (error) {
            console.error("Failed to load exams", error);
        } finally {
            setLoading(false);
        }
    };

    const parseDate = (dateStr) => {
        if (!dateStr) return new Date();
        // Handle DD-MM-YYYY
        if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
            const [day, month, year] = dateStr.split('-');
            return new Date(`${year}-${month}-${day}`);
        }
        return new Date(dateStr);
    };

    const processExams = (data) => {
        const now = new Date();
        let upcoming = 0;
        let active = 0;
        let completed = 0;

        const processed = data.map(exam => {
            const start = parseDate(exam.startDate);
            const end = parseDate(exam.endDate);
            let status = 'upcoming';

            // Set end of day for end date to allow active status on the last day
            end.setHours(23, 59, 59, 999);

            if (start <= now && end >= now) {
                status = 'active';
                active++;
            } else if (end < now) {
                status = 'completed';
                completed++;
            } else {
                upcoming++;
            }

            return { ...exam, status, _parsedStart: start, _parsedEnd: end };
        });

        setExams(processed);
        setStats({ total: data.length, upcoming, active, completed });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        // Use the parser ensures valid date object
        const date = parseDate(dateString);
        if (isNaN(date.getTime())) return dateString; // Fallback
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const StatusBadge = ({ status }) => {
        let bg = theme.primary + '20';
        let color = theme.primary;

        if (status === 'active') {
            bg = '#dcfce7'; // green-100
            color = '#166534'; // green-800
        } else if (status === 'completed') {
            bg = theme.surfaceBorder;
            color = theme.textSecondary;
        }

        return (
            <View style={[styles.badge, { backgroundColor: bg }]}>
                <Text style={[styles.badgeText, { color: color }]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
            </View>
        );
    };

    const renderStatCard = (title, value, color, icon) => (
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.statHeader}>
                <Text style={[styles.statTitle, { color: theme.textSecondary }]}>{title}</Text>
                <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                    {icon}
                </View>
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header / Stats */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {renderStatCard("Total", stats.total, theme.primary, <Book size={16} color={theme.primary} />)}
                    {renderStatCard("Active", stats.active, '#22c55e', <AlertCircle size={16} color="#22c55e" />)}
                    {renderStatCard("Upcoming", stats.upcoming, '#3b82f6', <Calendar size={16} color="#3b82f6" />)}
                    {renderStatCard("Done", stats.completed, '#64748b', <Clock size={16} color="#64748b" />)}
                </View>

                {/* Exams List */}
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>All Examinations</Text>

                {exams.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Book size={48} color={theme.textSecondary} style={{ opacity: 0.5 }} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No exams found.</Text>
                    </View>
                ) : (
                    exams.map((exam, index) => {
                        const start = exam._parsedStart || new Date();
                        const end = exam._parsedEnd || new Date();
                        const isFuture = start > new Date();

                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.9}
                                onPress={() => {
                                    // Strip non-serializable fields (Dates)
                                    const { _parsedStart, _parsedEnd, ...serializableExam } = exam;
                                    navigation.navigate('CreateExam', { isEdit: true, examData: serializableExam });
                                }}
                                style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={[styles.dateBox, { backgroundColor: isFuture ? theme.primary + '15' : theme.background }]}>
                                        <Text style={[styles.day, { color: isFuture ? theme.primary : theme.textSecondary }]}>
                                            {start.getDate()}
                                        </Text>
                                        <Text style={[styles.month, { color: theme.textSecondary }]}>
                                            {start.toLocaleString('default', { month: 'short' })}
                                        </Text>
                                    </View>

                                    <View style={styles.info}>
                                        <Text style={[styles.examName, { color: theme.textPrimary }]}>{exam.name}</Text>
                                        <View style={styles.metaRow}>
                                            <Text style={[styles.subject, { color: theme.textSecondary }]}>
                                                {exam.subjects?.length || 0} Subjects
                                            </Text>
                                            <Text style={[styles.dot, { color: theme.textSecondary }]}>•</Text>
                                            <Text style={[styles.subject, { color: theme.textSecondary }]}>
                                                {exam.examType}
                                            </Text>
                                        </View>
                                    </View>

                                    <StatusBadge status={exam.status} />
                                </View>

                                {/* Divider */}
                                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                                {/* footer info */}
                                <View style={styles.cardFooter}>
                                    <View style={styles.footerItem}>
                                        <Clock size={14} color={theme.textSecondary} />
                                        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                                            {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
                                        </Text>
                                    </View>

                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]} // red-100
                                            onPress={() => {
                                                Alert.alert(
                                                    "Delete Exam",
                                                    "Are you sure?",
                                                    [
                                                        { text: "Cancel", style: "cancel" },
                                                        {
                                                            text: "Delete",
                                                            style: "destructive",
                                                            onPress: async () => {
                                                                try {
                                                                    setLoading(true);
                                                                    await teacherApi.deleteExam(exam._id);
                                                                    loadExams();
                                                                } catch (e) { Alert.alert("Error", "Failed to delete"); setLoading(false); }
                                                            }
                                                        }
                                                    ]
                                                );
                                            }}
                                        >
                                            <Trash2 size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}

                <View style={{ height: 80 }} />
            </ScrollView>

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('CreateExam')}
            >
                <Plus color="#fff" size={24} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'flex-start'
    },
    statTitle: {
        fontSize: 13,
        fontWeight: '600',
    },
    iconBox: {
        padding: 8,
        borderRadius: 10,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        marginLeft: 4
    },
    card: {
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    dateBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    day: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    month: {
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    info: {
        flex: 1,
    },
    examName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subject: {
        fontSize: 13,
    },
    dot: {
        marginHorizontal: 6,
        fontSize: 10
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 8,
        borderRadius: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
    }
});

export default ExamsScreen;
