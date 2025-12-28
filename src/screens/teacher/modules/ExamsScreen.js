import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { useTheme } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { teacherApi } from '../../../api/teacherApi';
import { Calendar, Clock, Plus, FileText } from 'lucide-react-native';

const ExamsScreen = () => {
    const { theme } = useTheme();
    const { userInfo } = useAuth();
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([]);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const assignedClass = userInfo?.classTeacher || "IV";
            const assignedSection = userInfo?.section || "A";
            const data = await teacherApi.getExams(assignedClass, assignedSection);

            if (data && Array.isArray(data)) {
                // Sort by date descending
                setExams(data.sort((a, b) => new Date(b.examDate) - new Date(a.examDate)));
            }
        } catch (error) {
            console.error("Exams: Failed to load", error);
        } finally {
            setLoading(false);
        }
    };

    const renderExamItem = ({ item }) => {
        const examDate = new Date(item.examDate);
        const isFuture = examDate >= new Date();

        return (
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={[styles.dateBox, { backgroundColor: isFuture ? theme.primary + '15' : theme.background }]}>
                    <Text style={[styles.day, { color: isFuture ? theme.primary : theme.textSecondary }]}>
                        {examDate.getDate()}
                    </Text>
                    <Text style={[styles.month, { color: theme.textSecondary }]}>
                        {examDate.toLocaleString('default', { month: 'short' })}
                    </Text>
                </View>

                <View style={styles.info}>
                    <Text style={[styles.examName, { color: theme.textPrimary }]}>{item.examName}</Text>
                    <Text style={[styles.subject, { color: theme.textSecondary }]}>{item.subject || "All Subjects"}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Clock size={12} color={theme.textSecondary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                                {examDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        {/* <View style={styles.metaItem}>
                            <FileText size={12} color={theme.textSecondary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>100 Marks</Text>
                        </View> */}
                    </View>
                </View>

                {isFuture && (
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Upcoming</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={exams}
                renderItem={renderExamItem}
                keyExtractor={(item, index) => item._id || index.toString()}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchExams} tintColor={theme.primary} />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.empty}>
                            <FileText size={48} color={theme.textSecondary} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No exams scheduled.</Text>
                        </View>
                    )
                }
            />

            <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]}>
                <Plus color="#fff" size={24} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
        alignItems: 'center',
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
    subject: {
        fontSize: 14,
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
    },
    statusBadge: {
        backgroundColor: '#dcfce7', // light green
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: '#16a34a',
        fontSize: 10,
        fontWeight: '700',
    },
    empty: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 10,
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
    },
});

export default ExamsScreen;
