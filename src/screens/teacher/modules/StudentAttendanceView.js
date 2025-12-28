import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    Modal
} from 'react-native';
import { useTheme } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { teacherApi } from '../../../api/teacherApi';
import { Calendar, Save, CheckCircle, BarChart2, Edit3, ChevronLeft, ChevronRight } from 'lucide-react-native';

const StudentAttendanceView = () => {
    const { theme } = useTheme();
    const { userInfo } = useAuth();

    // Mode: 'mark' | 'overview'
    const [mode, setMode] = useState('mark');

    // Stats State
    const [loadingStats, setLoadingStats] = useState(false);
    const [statsData, setStatsData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    // Mark State
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // { studentId: true(Present) | false(Absent) }
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (mode === 'overview') {
            fetchMonthlyStats();
        }
    }, [mode, selectedMonth]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const assignedClass = userInfo?.classTeacher || "IV";
            const assignedSection = userInfo?.section || "A";

            const data = await teacherApi.getAllStudents(assignedClass, assignedSection);

            if (data && Array.isArray(data)) {

                const initialAttendance = {};
                // Filter valid students like web client does (must have studentId)
                const validStudents = data.filter(s => s.studentId);

                validStudents.forEach(s => {
                    initialAttendance[s.studentId] = false;
                });

                setAttendance(initialAttendance);
                setStudents(validStudents);
            } else {
                setStudents([]);
            }
        } catch (error) {
            console.error("Attendance: Failed to load students", error);
            Alert.alert("Error", "Could not load student list.");
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyStats = async () => {
        setLoadingStats(true);
        try {
            const year = selectedMonth.getFullYear();
            const month = selectedMonth.getMonth() + 1; // 1-12

            const response = await teacherApi.getStudentAttendance(year, month);
            // Check for existence of data array, as API might return { message: true, data: [] } or { success: true, data: [] }
            if (response && Array.isArray(response.data)) {
                // Process data to calculate totals
                // response.data is array of students with 'attendanceData' array
                const processed = response.data.map(s => {
                    // Match with local student list to get Name/RollNo
                    const localStudent = students.find(st => st.studentId === s.studentId);

                    const presentCount = s.attendanceData?.filter(r => r.present)?.length || 0;
                    return {
                        studentId: s.studentId,
                        studentName: localStudent?.studentName || "Unknown Student",
                        rollNo: localStudent?.rollNo || "N/A",
                        presentCount: presentCount,
                        totalDays: s.attendanceData?.length || 0
                    };
                });
                setStatsData(processed);
            } else {
                setStatsData([]);
            }
        } catch (error) {
            console.error("Failed to fetch monthly stats", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const toggleStatus = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const markAll = (status) => {
        const newAtt = {};
        students.forEach(s => {
            newAtt[s.studentId] = status;
        });
        setAttendance(newAtt);
    };

    const submitAttendance = async () => {
        if (students.length === 0) return;

        setSubmitting(true);
        try {
            const todayStr = date.toISOString().split('T')[0];
            const session = userInfo?.session || "2024-2025";

            const records = students.map(s => ({
                session: session,
                studentId: s.studentId,
                rollNo: s.rollNo,
                present: attendance[s.studentId],
                date: todayStr,
                className: s.className || s.class,
                section: s.section
            }));

            const payload = { attendanceRecords: records };

            const response = await teacherApi.submitStudentAttendance(payload);

            if (response && response.success) {
                Alert.alert("Success", response.message || "Attendance Submitted Successfully!");
                markAll(false);
            } else {
                Alert.alert("Error", response?.message || "Submission failed.");
            }

        } catch (error) {
            console.error("Submit Attendance Failed", error);
            Alert.alert("Error", "Failed to submit attendance.");
        } finally {
            setSubmitting(false);
        }
    };

    const changeMonth = (delta) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedMonth(newDate);
    };

    const renderMarkItem = ({ item }) => {
        const isPresent = attendance[item.studentId] || false;
        return (
            <TouchableOpacity
                style={[styles.studentRow, { backgroundColor: theme.surface, borderColor: isPresent ? theme.primary : 'transparent', borderWidth: 1 }]}
                onPress={() => toggleStatus(item.studentId)}
                activeOpacity={0.7}
            >
                <View style={styles.studentInfo}>
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
                        <Text style={{ color: theme.textSecondary, fontWeight: 'bold' }}>
                            {item.studentName ? item.studentName.substring(0, 1) : "?"}
                        </Text>
                    </View>
                    <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.name, { color: theme.textPrimary }]}>{item.studentName}</Text>
                        <Text style={[styles.roll, { color: theme.textSecondary }]}>Roll No: {item.rollNo || "N/A"}</Text>
                    </View>
                </View>
                <View style={styles.statusIndicator}>
                    {isPresent ? (
                        <CheckCircle size={24} color="#16a34a" fill="#dcfce7" />
                    ) : (
                        <View style={[styles.radioEmpty, { borderColor: theme.border }]} />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderOverviewItem = ({ item }) => (
        <View style={[styles.studentRow, { backgroundColor: theme.surface }]}>
            <View style={styles.studentInfo}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
                    <Text style={{ color: theme.textSecondary, fontWeight: 'bold' }}>
                        {item.studentName ? item.studentName.substring(0, 1) : "?"}
                    </Text>
                </View>
                <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.name, { color: theme.textPrimary }]}>{item.studentName}</Text>
                    <Text style={[styles.roll, { color: theme.textSecondary }]}>Roll No: {item.rollNo || "N/A"}</Text>
                </View>
            </View>
            <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.primary }}>{item.presentCount}</Text>
                <Text style={{ fontSize: 10, color: theme.textSecondary }}>Present</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            {/* Sub-Header / Toggle */}
            <View style={[styles.toggleContainer, { backgroundColor: theme.surface }]}>
                <TouchableOpacity
                    style={[styles.toggleBtn, mode === 'mark' && { backgroundColor: theme.backgroundSecondary }]}
                    onPress={() => setMode('mark')}
                >
                    <Edit3 size={16} color={mode === 'mark' ? theme.textPrimary : theme.textSecondary} />
                    <Text style={[styles.toggleText, { color: mode === 'mark' ? theme.textPrimary : theme.textSecondary }]}>Mark Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, mode === 'overview' && { backgroundColor: theme.backgroundSecondary }]}
                    onPress={() => setMode('overview')}
                >
                    <BarChart2 size={16} color={mode === 'overview' ? theme.textPrimary : theme.textSecondary} />
                    <Text style={[styles.toggleText, { color: mode === 'overview' ? theme.textPrimary : theme.textSecondary }]}>Overview</Text>
                </TouchableOpacity>
            </View>

            {mode === 'mark' ? (
                <>
                    {/* Date & Bulk Actions */}
                    <View style={[styles.header, { backgroundColor: theme.surface }]}>
                        <View style={styles.dateInfo}>
                            <Calendar color={theme.textSecondary} size={18} />
                            <Text style={{ marginLeft: 8, color: theme.textPrimary, fontWeight: '600' }}>
                                {date.toDateString()}
                            </Text>
                        </View>
                        <View style={styles.bulkActions}>
                            <TouchableOpacity onPress={() => markAll(true)} style={[styles.bulkBtn, { backgroundColor: '#dcfce7' }]}>
                                <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: 'bold' }}>All P</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => markAll(false)} style={[styles.bulkBtn, { backgroundColor: '#fee2e2' }]}>
                                <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: 'bold' }}>All A</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
                    ) : (
                        <FlatList
                            data={students}
                            renderItem={renderMarkItem}
                            keyExtractor={item => item.studentId}
                            contentContainerStyle={styles.list}
                            ListEmptyComponent={
                                <Text style={{ textAlign: 'center', marginTop: 40, color: theme.textSecondary }}>No students found.</Text>
                            }
                        />
                    )}

                    {students.length > 0 && (
                        <TouchableOpacity
                            style={[styles.fab, { backgroundColor: theme.primary }]}
                            onPress={submitAttendance}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Save color="#fff" size={24} />
                                    <Text style={styles.fabText}>Submit</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </>
            ) : (
                <>
                    {/* Month Selector */}
                    <View style={[styles.header, { backgroundColor: theme.surface, justifyContent: 'center' }]}>
                        <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 8 }}>
                            <ChevronLeft color={theme.textPrimary} size={24} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textPrimary, marginHorizontal: 20 }}>
                            {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 8 }}>
                            <ChevronRight color={theme.textPrimary} size={24} />
                        </TouchableOpacity>
                    </View>

                    {loadingStats ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
                    ) : (
                        <FlatList
                            data={statsData}
                            renderItem={renderOverviewItem}
                            keyExtractor={item => item.studentId}
                            contentContainerStyle={styles.list}
                            ListHeaderComponent={
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 8 }}>
                                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Student</Text>
                                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Monthly Count</Text>
                                </View>
                            }
                            ListEmptyComponent={
                                <Text style={{ textAlign: 'center', marginTop: 40, color: theme.textSecondary }}>No records found for this month.</Text>
                            }
                        />
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    toggleContainer: {
        flexDirection: 'row',
        padding: 4,
        margin: 16,
        borderRadius: 12,
        marginBottom: 8
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8
    },
    toggleText: {
        fontWeight: '600',
        fontSize: 14,
    },
    header: {
        padding: 16,
        marginHorizontal: 16,
        marginTop: 0,
        marginBottom: 16,
        borderRadius: 12,
        elevation: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    bulkActions: {
        flexDirection: 'row',
        gap: 10,
    },
    bulkBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 1,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
    },
    roll: {
        fontSize: 12,
    },
    statusIndicator: {
        padding: 4
    },
    radioEmpty: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    fabText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    }
});

export default StudentAttendanceView;
