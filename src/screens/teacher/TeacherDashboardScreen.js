import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
    Image,
    StatusBar
} from 'react-native';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { teacherApi } from '../../api/teacherApi';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Users,
    BookOpen,
    Calendar,
    Clock,
    ChevronRight,
    Bell,
    CheckCircle,
    TrendingUp,
    FileText,
    Brain,
    Menu,
    Sun,
    Moon
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TeacherDashboardScreen = ({ navigation, openSidebar }) => {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { userInfo } = useAuth();
    const [loading, setLoading] = useState(false);

    // Dynamic Data States
    const [studentCount, setStudentCount] = useState(0);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [todaysClasses, setTodaysClasses] = useState(6); // Default/Mock for now
    const [stats, setStats] = useState({
        pendingAssignments: 12,
        avgAttendance: 85
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            console.log("Dashboard - UserInfo:", JSON.stringify(userInfo));
            // Default to Class IV/A if missing
            const assignedClass = userInfo?.classTeacher || "IV";
            const assignedSection = userInfo?.section || "A";
            console.log(`Fetching data for Class: ${assignedClass}, Section: ${assignedSection}`);

            // 1. Fetch Students
            try {
                const students = await teacherApi.getAllStudents(assignedClass, assignedSection);
                console.log("Fetched Students Count:", students?.length);
                if (students) {
                    setStudentCount(Array.isArray(students) ? students.length : 0);
                }
            } catch (err) { console.log("Student fetch error", err); }

            // 2. Fetch Exams (as Upcoming Events)
            try {
                const exams = await teacherApi.getExams(assignedClass, assignedSection);
                console.log("Fetched Exams:", exams?.length);
                if (exams && Array.isArray(exams)) {
                    // Helper to parse DD-MM-YYYY or ISO
                    const parseDate = (d) => {
                        if (!d) return new Date(0); // far past
                        if (typeof d === 'string' && d.includes('-') && d.split('-')[0].length === 2) {
                            const [day, month, year] = d.split('-');
                            return new Date(`${year}-${month}-${day}`);
                        }
                        return new Date(d);
                    };

                    const now = new Date();
                    // Set now to start of day to show today's exams as upcoming/active
                    now.setHours(0, 0, 0, 0);

                    const futureExams = exams
                        .map(e => ({
                            ...e,
                            _parsedDate: parseDate(e.startDate) // Use startDate for sorting
                        }))
                        .filter(e => e._parsedDate >= now)
                        .sort((a, b) => a._parsedDate - b._parsedDate)
                        .slice(0, 3);

                    setUpcomingExams(futureExams);
                } else {
                    setUpcomingExams([]);
                }
            } catch (err) { console.log("Exam fetch error", err); }

        } catch (e) {
            console.log("Dashboard Global Fetch Error", e);
        } finally {
            setLoading(false);
        }
    }, [userInfo]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const QuickActionButton = ({ title, icon: Icon, colors, onPress, desc }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.actionCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIconContainer}
            >
                <Icon size={24} color="#FFF" />
            </LinearGradient>
            <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>{title}</Text>
                <Text style={[styles.actionDesc, { color: theme.textSecondary }]} numberOfLines={1}>{desc}</Text>
            </View>
            <ChevronRight size={16} color={theme.textSecondary} style={{ opacity: 0.5 }} />
        </TouchableOpacity>
    );

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.statHeader]}>
                <View style={[styles.statIconBadge, { backgroundColor: color + '20' }]}>
                    <Icon size={20} color={color} />
                </View>
                {/* <TrendingUp size={16} color={theme.success} /> */}
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
            <Text style={[styles.statTitle, { color: theme.textSecondary }]}>{title}</Text>
            <Text style={[styles.statSubtext, { color: theme.textSecondary }]}>{subtext}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={theme.primary} />
                }
            >
                {/* 1. Welcome Header (Premium Gradient) */}
                <LinearGradient
                    colors={['#4F46E5', '#7C3AED']} // Blue to Purple
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={openSidebar} style={{ marginRight: 15 }}>
                                <Menu size={28} color="#FFF" />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.greetingText}>Welcome Back,</Text>
                                <Text style={styles.teacherNameText}>{userInfo?.name || "Teacher"}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            <TouchableOpacity onPress={toggleTheme}>
                                {isDarkMode ? <Sun size={24} color="#FFF" /> : <Moon size={24} color="#FFF" />}
                            </TouchableOpacity>
                            <View style={styles.notificationBadge}>
                                <Bell size={24} color="#FFF" />
                                <View style={styles.redDot} />
                            </View>
                        </View>
                    </View>
                    <Text style={styles.classInfoText}>Class Teacher: {userInfo?.class || "10"} - {userInfo?.section || "A"}</Text>

                    {/* Floating Summary Card */}
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{studentCount}</Text>
                            <Text style={styles.summaryLabel}>Students</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{todaysClasses}</Text>
                            <Text style={styles.summaryLabel}>Classes</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{stats.avgAttendance}%</Text>
                            <Text style={styles.summaryLabel}>Avg. Attd</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.mainBody}>

                    {/* 2. Quick Actions Grid */}
                    <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <QuickActionButton
                            title="Attendance"
                            desc="Mark today's attendance"
                            icon={CheckCircle}
                            colors={['#10B981', '#059669']}
                            onPress={() => navigation.navigate('Attendance')}
                        />
                        <QuickActionButton
                            title="Assignments"
                            desc="Create & review tasks"
                            icon={BookOpen}
                            colors={['#3B82F6', '#2563EB']}
                            onPress={() => navigation.navigate('AssignmentsList')}
                        />
                        <QuickActionButton
                            title="My Students"
                            desc="View class list"
                            icon={Users}
                            colors={['#8B5CF6', '#7C3AED']}
                            onPress={() => navigation.navigate('MyStudents')}
                        />
                        <QuickActionButton
                            title="Exams"
                            desc="Schedule & results"
                            icon={FileText}
                            colors={['#F59E0B', '#D97706']}
                            onPress={() => navigation.navigate('Exams')}
                        />
                    </View>

                    {/* 3. Detailed Stats Grid */}
                    <Text style={[styles.sectionHeader, { color: theme.textPrimary, marginTop: 24 }]}>Overview</Text>
                    <View style={styles.statsGrid}>
                        <StatCard
                            title="Total Students"
                            value={studentCount}
                            icon={Users}
                            color="#8B5CF6"
                            subtext="Active in class"
                        />
                        <StatCard
                            title="Classes Today"
                            value={todaysClasses}
                            icon={Clock}
                            color="#3B82F6"
                            subtext="6 Remaining"
                        />
                        <StatCard
                            title="Pending Tasks"
                            value={stats.pendingAssignments}
                            icon={BookOpen}
                            color="#F59E0B"
                            subtext="Assignments"
                        />
                        <StatCard
                            title="Attendance"
                            value={`${stats.avgAttendance}%`}
                            icon={TrendingUp}
                            color="#10B981"
                            subtext="Weekly Avg"
                        />
                    </View>

                    {/* 4. AI Hub Banner */}
                    <TouchableOpacity
                        style={styles.aiBanner}
                        onPress={() => navigation.navigate('AIFeatures')}
                    >
                        <LinearGradient
                            colors={['#1E293B', '#334155']}
                            style={styles.aiGradient}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.aiContent}>
                                <View style={styles.aiIconBox}>
                                    <Brain size={28} color="#C084FC" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.aiTitle}>AI Teaching Assistant</Text>
                                    <Text style={styles.aiDesc}>Generate lesson plans, quizzes & more instantly.</Text>
                                </View>
                                <ChevronRight size={20} color="#94A3B8" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* 5. Upcoming Events/Exams */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionHeader, { color: theme.textPrimary, marginTop: 24 }]}>Upcoming Exams</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Exams')}>
                            <Text style={{ color: theme.primary, marginTop: 24, fontWeight: '600' }}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {upcomingExams.length > 0 ? (
                        upcomingExams.map((exam, index) => {
                            const dateObj = exam._parsedDate || new Date();
                            return (
                                <View key={index} style={[styles.examCard, { backgroundColor: theme.surface, borderLeftColor: theme.primary }]}>
                                    <View style={styles.examDateBox}>
                                        <Text style={[styles.examDateDay, { color: theme.primary }]}>{dateObj.getDate()}</Text>
                                        <Text style={[styles.examDateMonth, { color: theme.textSecondary }]}>
                                            {dateObj.toLocaleString('default', { month: 'short' })}
                                        </Text>
                                    </View>
                                    <View style={styles.examInfo}>
                                        <Text style={[styles.examTitle, { color: theme.textPrimary }]}>{exam.name}</Text>
                                        <Text style={[styles.examSubject, { color: theme.textSecondary }]}>
                                            {exam.subjects?.length ? `${exam.subjects.length} Subjects` : "General"}
                                        </Text>
                                    </View>
                                    <View style={[styles.examTimeBadge, { backgroundColor: theme.background }]}>
                                        <Clock size={12} color={theme.textSecondary} />
                                        <Text style={[styles.examTimeText, { color: theme.textSecondary }]}>
                                            {/* Time might not be in Exam object, usually full day. Showing Type instead if time missing */}
                                            {exam.examType}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
                            <Text style={{ textAlign: 'center', color: theme.textSecondary }}>No upcoming exams scheduled.</Text>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    headerGradient: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    greetingText: {
        fontSize: 16,
        color: '#E0E7FF',
        fontWeight: '500',
    },
    teacherNameText: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: 'bold',
        marginVertical: 4,
    },
    classInfoText: {
        fontSize: 14,
        color: '#C7D2FE',
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 10, // Added margin
        overflow: 'hidden',
    },
    notificationBadge: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        position: 'relative',
    },
    redDot: {
        width: 8,
        height: 8,
        backgroundColor: '#EF4444',
        borderRadius: 4,
        position: 'absolute',
        top: 8,
        right: 8,
        borderWidth: 1,
        borderColor: '#FFF',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#E0E7FF',
        marginTop: 2,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginVertical: 5,
    },
    mainBody: {
        marginTop: -30, // Overlap effect
        paddingHorizontal: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        width: (width - 50) / 2, // 2 column
        borderRadius: 16,
        padding: 12,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    actionDesc: {
        fontSize: 11,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: (width - 50) / 2,
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statIconBadge: {
        padding: 8,
        borderRadius: 10,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    statSubtext: {
        fontSize: 11,
        opacity: 0.7,
    },
    aiBanner: {
        marginTop: 10,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        marginBottom: 10,
    },
    aiGradient: {
        padding: 20,
    },
    aiContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(192, 132, 252, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(192, 132, 252, 0.3)',
    },
    aiTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    aiDesc: {
        fontSize: 12,
        color: '#94A3B8',
    },
    examCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
        borderLeftWidth: 4,
    },
    examDateBox: {
        alignItems: 'center',
        paddingRight: 15,
        borderRightWidth: 1,
        borderRightColor: 'rgba(0,0,0,0.05)',
        marginRight: 15,
        minWidth: 50,
    },
    examDateDay: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    examDateMonth: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    examInfo: {
        flex: 1,
    },
    examTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    examSubject: {
        fontSize: 13,
    },
    examTimeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    examTimeText: {
        fontSize: 11,
        marginLeft: 4,
        fontWeight: '500',
    },
    emptyCard: {
        padding: 20,
        alignItems: 'center',
        borderRadius: 12,
    }
});

export default TeacherDashboardScreen;
