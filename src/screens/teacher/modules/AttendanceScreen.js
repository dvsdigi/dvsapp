import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image
} from 'react-native';
import { useTheme } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { teacherApi } from '../../../api/teacherApi';
import { Calendar, Check, X, Save, User } from 'lucide-react-native';

const AttendanceScreen = () => {
    const { theme } = useTheme();
    const { userInfo } = useAuth();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // { studentId: 'Present' | 'Absent' }
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const assignedClass = userInfo?.classTeacher || "IV";
            const assignedSection = userInfo?.section || "A";
            const data = await teacherApi.getAllStudents(assignedClass, assignedSection);

            if (data && Array.isArray(data)) {
                // Initialize all as Present by default
                const initialAttendance = {};
                data.forEach(s => {
                    initialAttendance[s._id] = 'Present';
                });
                setAttendance(initialAttendance);
                setStudents(data);
            }
        } catch (error) {
            console.error("Attendance: Failed to load students", error);
            Alert.alert("Error", "Could not load student list.");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const submitAttendance = async () => {
        // Prepare payload
        const payload = {
            date: date.toISOString().split('T')[0],
            class: userInfo?.classTeacher || "IV",
            section: userInfo?.section || "A",
            records: Object.keys(attendance).map(id => ({
                studentId: id,
                status: attendance[id]
            }))
        };
        console.log("Submitting Attendance:", payload);
        Alert.alert("Success", "Attendance Saved (Mock)");
        // TODO: Call API to save attendance
        // await teacherApi.submitAttendance(payload);
    };

    const renderItem = ({ item }) => {
        const status = attendance[item._id] || 'Present';
        const isPresent = status === 'Present';

        return (
            <View style={[styles.studentRow, { backgroundColor: theme.surface }]}>
                <View style={styles.studentInfo}>
                    {item.studentImage?.url ? (
                        <Image source={{ uri: item.studentImage.url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
                            <Text style={{ color: theme.textSecondary, fontWeight: 'bold' }}>
                                {item.studentName ? item.studentName.substring(0, 1) : "?"}
                            </Text>
                        </View>
                    )}
                    <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.name, { color: theme.textPrimary }]}>{item.studentName}</Text>
                        <Text style={[styles.roll, { color: theme.textSecondary }]}>Roll No: {item.rollNo || "N/A"}</Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[
                            styles.statusBtn,
                            { backgroundColor: isPresent ? '#dcfce7' : theme.backgroundSecondary, borderColor: isPresent ? '#16a34a' : theme.border }
                        ]}
                        onPress={() => setAttendance(prev => ({ ...prev, [item._id]: 'Present' }))}
                    >
                        <Text style={{ color: isPresent ? '#16a34a' : theme.textSecondary, fontWeight: '600' }}>P</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.statusBtn,
                            { backgroundColor: !isPresent ? '#fee2e2' : theme.backgroundSecondary, borderColor: !isPresent ? '#dc2626' : theme.border }
                        ]}
                        onPress={() => setAttendance(prev => ({ ...prev, [item._id]: 'Absent' }))}
                    >
                        <Text style={{ color: !isPresent ? '#dc2626' : theme.textSecondary, fontWeight: '600' }}>A</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header / Date Selector */}
            <View style={[styles.dateHeader, { backgroundColor: theme.surface }]}>
                <Text style={[styles.dateText, { color: theme.textPrimary }]}>
                    {date.toDateString()}
                </Text>
                <Calendar color={theme.primary} size={20} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={students}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={submitAttendance}
            >
                <Save color="#fff" size={24} />
                <Text style={styles.fabText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dateHeader: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 16,
        borderRadius: 12,
        elevation: 2,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
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
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
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
    },
    fabText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    }
});

export default AttendanceScreen;
