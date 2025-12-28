import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';

const AssignmentDetailsScreen = ({ route, navigation }) => {
    const { assignment } = route.params;
    const { theme } = useTheme();

    const openDocument = () => {
        if (assignment.file && assignment.file.url) {
            Linking.openURL(assignment.file.url).catch(err => {
                console.error("Failed to open URL:", err);
                alert("Could not open the file.");
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Assignment Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>

                {/* Main Card */}
                <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>{assignment.title}</Text>
                        <View style={[
                            styles.badge,
                            { backgroundColor: theme.primary + '15' }
                        ]}>
                            <Text style={[styles.badgeText, { color: theme.primary }]}>
                                {assignment.subject}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Due Date: {formatDate(assignment.dueDate)}</Text>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Description</Text>
                    <Text style={[styles.description, { color: theme.textSecondary }]}>{assignment.description}</Text>

                    <View style={[styles.metaContainer, { backgroundColor: theme.background }]}>
                        <View style={styles.metaItem}>
                            <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Class</Text>
                            <Text style={[styles.metaValue, { color: theme.textPrimary }]}>{assignment.className}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Section</Text>
                            <Text style={[styles.metaValue, { color: theme.textPrimary }]}>{assignment.section}</Text>
                        </View>
                    </View>
                </View>

                {/* Document Section */}
                {assignment.file && assignment.file.url ? (
                    <TouchableOpacity style={[styles.docButton, { shadowColor: theme.shadow }]} onPress={openDocument}>
                        <View
                            style={[styles.docContent, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                                <Ionicons name="document-text" size={32} color={theme.primary} />
                            </View>
                            <View style={styles.docInfo}>
                                <Text style={[styles.docTitle, { color: theme.textPrimary }]}>Attached Document</Text>
                                <Text style={[styles.docSubtitle, { color: theme.textSecondary }]}>Tap to view PDF</Text>
                            </View>
                            <Ionicons name="open-outline" size={24} color={theme.textSecondary} />
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.noDocContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <Ionicons name="document-outline" size={48} color={theme.textSecondary} />
                        <Text style={[styles.noDocText, { color: theme.textSecondary }]}>No document attached</Text>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    card: {
        borderRadius: 16,
        padding: 24,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 12,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateLabel: {
        fontSize: 14,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 20,
    },
    metaContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
    },
    metaItem: {
        flex: 1,
        alignItems: 'center',
    },
    metaLabel: {
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metaValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    docButton: {
        borderRadius: 16,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    docContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    docInfo: {
        flex: 1,
    },
    docTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    docSubtitle: {
        fontSize: 13,
    },
    noDocContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    noDocText: {
        marginTop: 12,
        fontSize: 14,
    },
});

export default AssignmentDetailsScreen;
