import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

const ModulePlaceholder = ({ title, desc }) => {
    const { theme } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient
                colors={[theme.primary + '10', theme.background]}
                style={styles.gradient}
            />
            <View style={[styles.content, { borderColor: theme.surfaceBorder }]}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
                <Text style={[styles.desc, { color: theme.textSecondary }]}>{desc}</Text>
                <View style={[styles.statusBadge, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.statusText, { color: theme.primary }]}>Coming Soon</Text>
                </View>
            </View>
        </View>
    );
};

export const MyStudentsScreen = () => <ModulePlaceholder title="My Students" desc="Manage student profiles and academic records." />;
export const AttendanceScreen = () => <ModulePlaceholder title="Attendance" desc="Track daily attendance and generate reports." />;
export const AssignmentsScreen = () => <ModulePlaceholder title="Assignments" desc="Create and grade student assignments." />;
export const ExamsScreen = () => <ModulePlaceholder title="Exams & Results" desc="Schedule exams and publish results." />;
export const LecturesScreen = () => <ModulePlaceholder title="Lectures" desc="Manage lesson plans and digital content." />;
export const StudyScreen = () => <ModulePlaceholder title="Study Material" desc="Upload and share study resources." />;
export const CurriculumScreen = () => <ModulePlaceholder title="Curriculum" desc="Plan academic curriculum and syllabus." />;
export const PayrollScreen = () => <ModulePlaceholder title="My Payroll" desc="View salary slips and payment history." />;
export const AIFeaturesScreen = () => <ModulePlaceholder title="AI Features" desc="Smart insights and automated assistance." />;
export const AboutMeScreen = () => <ModulePlaceholder title="About Me" desc="Manage your teacher profile and settings." />;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        alignItems: 'center',
        padding: 32,
        borderRadius: 24,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    desc: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.8,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    statusText: {
        fontWeight: '600',
    },
});
