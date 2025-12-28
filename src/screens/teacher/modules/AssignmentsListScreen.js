import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { useTheme } from '../../../theme';
import { teacherApi } from '../../../api/teacherApi';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Plus, Trash2, FileText } from 'lucide-react-native';

const AssignmentsListScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAssignments = async () => {
        try {
            const response = await teacherApi.getAssignments();
            console.log("Assignments API Response:", JSON.stringify(response));
            if (response && response.allAssignment) {
                console.log("Found assignments:", response.allAssignment.length);
                setAssignments(response.allAssignment.reverse()); // Newest first
            } else {
                console.log("No assignments found in response.");
                setAssignments([]);
            }
        } catch (error) {
            console.error("Failed to fetch assignments", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchAssignments();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchAssignments();
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Assignment",
            "Are you sure you want to delete this assignment?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await teacherApi.deleteAssignment(id);
                            setAssignments(prev => prev.filter(a => a._id !== id));
                            Alert.alert("Success", "Assignment deleted.");
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete assignment.");
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
                onPress={() => navigation.navigate('AssignmentDetails', { assignment: item })}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '10' }]}>
                            <Ionicons name="book" size={24} color={theme.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{item.subject}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => handleDelete(item._id)}
                        style={styles.deleteButton}
                    >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardBody}>
                    <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
                        {item.description}
                    </Text>

                    <View style={styles.metaInfo}>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={14} color="#64748b" />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>{formatDate(item.dueDate)}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="people-outline" size={14} color="#64748b" />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>{item.className} - {item.section}</Text>
                        </View>
                    </View>

                    {item.file && item.file.url && (
                        <View style={[styles.attachmentBadge, { backgroundColor: theme.background }]}>
                            <FileText size={14} color={theme.primary} />
                            <Text style={{ marginLeft: 6, color: theme.primary, fontSize: 12 }}>Attachment Available</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {loading && !refreshing ? (
                <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={assignments}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <FileText size={48} color={theme.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No assignments created yet.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('CreateAssignment')}
            >
                <Plus size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loader: {
        marginTop: 50,
    },
    list: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
    },
    deleteButton: {
        padding: 8,
    },
    cardBody: {
        marginLeft: 52, // Align with title text (40px icon + 12px margin)
    },
    description: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    metaInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
    },
    attachmentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        marginTop: 8,
        alignSelf: 'flex-start',
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
        marginTop: 100,
        opacity: 0.7,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    }
});

export default AssignmentsListScreen;
