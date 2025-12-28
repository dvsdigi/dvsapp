import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../theme';
import { teacherApi } from '../../../api/teacherApi';
import { Clock, Calendar, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const LecturesScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [timetable, setTimetable] = useState(null);
    const [selectedDay, setSelectedDay] = useState("Monday");
    const [classInfo, setClassInfo] = useState({ class: '', section: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [teacherId, setTeacherId] = useState(null); // Actually timetableId
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadTimetable();
    }, []);

    const loadTimetable = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('userInfo');
            if (!storedUser) return;

            const user = JSON.parse(storedUser);
            setClassInfo({ class: user.classTeacher, section: user.section });

            if (user.classTeacher && user.section) {
                const data = await teacherApi.getClassTimeTable(user.classTeacher, user.section);
                if (data && data.timeTable && data.timeTable.length > 0) {
                    processTimetableData(data.timeTable[0]);
                    setTeacherId(data.timeTable[0]._id);
                } else {
                    // Initialize empty if no data found
                    setTimetable(createEmptyTimetable());
                }
            }
        } catch (error) {
            console.error("Failed to load timetable", error);
        } finally {
            setLoading(false);
        }
    };

    const processTimetableData = (data) => {
        // Transform API data (nested objects) into a cleaner map
        // Web client structure: { monday: { period1: "Math", ... }, ... }
        const processed = {};
        DAYS.forEach(day => {
            const dayKey = day.toLowerCase();
            const dayData = data[dayKey] || {};
            processed[day] = PERIODS.map(p => dayData[`period${p}`] || "");
        });
        setTimetable(processed);
    };

    const createEmptyTimetable = () => {
        const empty = {};
        DAYS.forEach(day => {
            empty[day] = Array(8).fill("");
        });
        return empty;
    };

    const handleCellChange = (periodIndex, text) => {
        setTimetable(prev => {
            const updatedDay = [...prev[selectedDay]];
            updatedDay[periodIndex] = text;
            return {
                ...prev,
                [selectedDay]: updatedDay
            };
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Format for API: { monday: { period1: "Math", ... }, ... }
            const formatted = {};
            DAYS.forEach(day => {
                const dayKey = day.toLowerCase();
                const dayPeriods = {};
                timetable[day].forEach((subject, idx) => {
                    dayPeriods[`period${idx + 1}`] = subject;
                });
                formatted[dayKey] = dayPeriods;
            });

            if (teacherId) {
                // Update implementation often uses create endpoint or update endpoint
                // Based on web client, it posts to 'createClassTimeTable' which seems to upsert or replace
                // But server logic showed "Time Table of that class and section is already created" error.
                // The web client calls delete first?? No, web client has update logic or delete then create.
                // Web client 'handleSubmit' calls 'timeTable/createClassTimeTable'.
                // If it exists, server returns error.
                // So we might need to DELETE first if we are "updating" via CREATE endpoint, OR use Update endpoint if available.
                // Obfuscated code had 'updateClassTimeTable'. Let's try that if ID exists, or Delete then Create.
                // The most reliable based on user request "delete not there" implies we should support Delete.
                // Let's try to Delete then Create if ID exists to be safe, essentially overwrite.

                await teacherApi.deleteClassTimeTable(teacherId);
            }

            const response = await teacherApi.createClassTimeTable(formatted);
            if (response && response.success) {
                alert("Timetable saved successfully!");
                setIsEditing(false);
                loadTimetable(); // Reload to get new ID
            }
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save timetable. " + (error.message || ""));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!teacherId) return;
        try {
            setSaving(true);
            await teacherApi.deleteClassTimeTable(teacherId);
            setTimetable(createEmptyTimetable());
            setTeacherId(null);
            setIsEditing(false);
            alert("Timetable deleted.");
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete.");
        } finally {
            setSaving(false);
        }
    };

    const renderDayTabs = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
        >
            {DAYS.map((day) => {
                const isActive = selectedDay === day;
                return (
                    <TouchableOpacity
                        key={day}
                        style={[
                            styles.tab,
                            isActive && { backgroundColor: theme.primary },
                            !isActive && { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }
                        ]}
                        onPress={() => setSelectedDay(day)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: isActive ? '#fff' : theme.textSecondary, fontWeight: isActive ? 'bold' : 'normal' }
                        ]}>
                            {day.substring(0, 3)}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );

    const renderPeriodItem = (periodNum, subject) => {
        const hasSubject = !!subject;

        return (
            <View key={periodNum} style={[styles.periodCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.periodNumberBox, { backgroundColor: hasSubject ? theme.primary + '15' : theme.border }]}>
                    <Text style={[styles.periodNumber, { color: hasSubject ? theme.primary : theme.textSecondary }]}>P{periodNum}</Text>
                </View>

                <View style={styles.periodContent}>
                    {isEditing ? (
                        <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={subject}
                                onChangeText={(text) => handleCellChange(periodNum - 1, text)}
                                placeholder="Enter Subject"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </View>
                    ) : (
                        hasSubject ? (
                            <>
                                <Text style={[styles.subjectText, { color: theme.textPrimary }]}>{subject}</Text>
                                <View style={styles.timeRow}>
                                    <Clock size={12} color={theme.textSecondary} />
                                    <Text style={[styles.timeText, { color: theme.textSecondary }]}>45 mins</Text>
                                </View>
                            </>
                        ) : (
                            <Text style={[styles.freePeriodText, { color: theme.textSecondary }]}>Free Period</Text>
                        )
                    )}
                </View>

                {hasSubject && (
                    <View style={[styles.statusIndicator, { backgroundColor: theme.primary }]} />
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const currentDaySchedule = timetable ? timetable[selectedDay] : [];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header / Info Card */}
            <View style={[styles.topInfo, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
                <LinearGradient
                    colors={isDarkMode ? [theme.surface, theme.surface] : ['#f0f9ff', '#e0f2fe']}
                    style={styles.classInfoCard}
                >
                    <View style={styles.infoRow}>
                        <View style={[styles.iconBox, { backgroundColor: '#3b82f6' }]}>
                            <BookOpen size={20} color="#fff" />
                        </View>
                        <View>
                            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Class Teacher</Text>
                            <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{classInfo.class} - {classInfo.section}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: isEditing ? theme.error + '15' : theme.primary + '15' }]}
                        onPress={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                    >
                        <Text style={[styles.actionBtnText, { color: isEditing ? theme.error : theme.primary }]}>
                            {isEditing ? "Cancel" : "Edit"}
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            <View style={{ height: 20 }} />

            {/* Day Selector */}
            {renderDayTabs()}

            {/* Timetable List */}
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.dayHeader, { color: theme.textPrimary }]}>{selectedDay}'s Schedule</Text>

                {currentDaySchedule.map((subject, index) =>
                    renderPeriodItem(index + 1, subject)
                )}

                <View style={{ height: 40 }} />

                {isEditing && (
                    <View style={styles.editActions}>
                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave} disabled={saving}>
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save All Changes</Text>}
                        </TouchableOpacity>

                        {teacherId && (
                            <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: theme.error }]} onPress={handleDelete} disabled={saving}>
                                <Text style={styles.saveBtnText}>Delete Timetable</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topInfo: {
        padding: 16,
        paddingBottom: 8,
    },
    classInfoCard: {
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    tabsContainer: {
        paddingHorizontal: 16,
        gap: 8,
        paddingBottom: 8,
        height: 50,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        justifyContent: 'center',
        height: 36,
    },
    tabText: {
        fontSize: 14,
    },
    listContent: {
        padding: 16,
    },
    dayHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    periodCard: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    periodNumberBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    periodNumber: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    periodContent: {
        flex: 1,
    },
    subjectText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 12,
    },
    freePeriodText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    statusIndicator: {
        width: 4,
        height: 24,
        borderRadius: 2,
        marginLeft: 12,
    },
    actionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    inputContainer: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    input: {
        fontSize: 16,
        fontWeight: '600',
    },
    editActions: {
        gap: 12,
        paddingTop: 16,
    },
    saveBtn: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteBtn: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default LecturesScreen;
