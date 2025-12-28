import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useTheme } from '../../../theme';
import { User, Phone, MapPin, Calendar, Mail, FileText, ArrowLeft, Edit } from 'lucide-react-native';

const StudentDetailsScreen = ({ route, navigation }) => {
    const { student } = route.params;
    const { theme } = useTheme();

    const InfoRow = ({ icon: Icon, label, value, isLink }) => (
        <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.surfaceBorder }]}>
                <Icon size={18} color={theme.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
                <Text
                    style={[styles.infoValue, { color: isLink ? theme.primary : theme.textPrimary }]}
                    onPress={() => {
                        if (isLink && label === 'Contact') Linking.openURL(`tel:${value}`);
                    }}
                >
                    {value || "N/A"}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.surface }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Student Profile</Text>

                {/* Navbar Edit Button */}
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('EditStudent', { student })}
                >
                    <Edit size={20} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.imageContainer}>
                        {student.studentImage?.url ? (
                            <Image source={{ uri: student.studentImage.url }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.placeholderImage, { backgroundColor: theme.primary + '20' }]}>
                                <Text style={[styles.initials, { color: theme.primary }]}>
                                    {student.studentName?.substring(0, 2).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <View style={[styles.statusBadge, { backgroundColor: student.status === 'active' ? '#10B981' : '#EF4444' }]}>
                            <Text style={styles.statusText}>{student.status?.toUpperCase() || 'UNKNOWN'}</Text>
                        </View>
                    </View>

                    <Text style={[styles.name, { color: theme.textPrimary }]}>{student.studentName}</Text>
                    <Text style={[styles.subText, { color: theme.textSecondary }]}>
                        Roll No: {student.rollNo} • Adm No: {student.admissionNumber}
                    </Text>
                </View>

                {/* Personal Details */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Personal Information</Text>
                    <InfoRow icon={Calendar} label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toDateString() : "N/A"} />
                    <InfoRow icon={User} label="Gender" value={student.gender} />
                    <InfoRow icon={Phone} label="Contact" value={student.contact} isLink />
                    <InfoRow icon={MapPin} label="Address" value={student.address} />
                </View>

                {/* Parent Details */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Parent Information</Text>
                    <InfoRow icon={User} label="Father's Name" value={student.fatherName} />
                    <InfoRow icon={User} label="Mother's Name" value={student.motherName} />
                </View>

                {/* Academic Details - Placeholder for now if needed */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Academic Info</Text>
                    <InfoRow icon={FileText} label="Class" value={`${student.class} - ${student.section}`} />
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        elevation: 2,
        justifyContent: 'space-between',
        marginTop: 30 // Rough StatusBar
    },
    backBtn: { padding: 8, marginRight: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
    editBtn: { padding: 8 },

    scrollContent: { padding: 16 },
    profileCard: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 1,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: { fontSize: 32, fontWeight: 'bold' },
    statusBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    statusText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    subText: { fontSize: 14 },

    section: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 12, marginBottom: 2 },
    infoValue: { fontSize: 14, fontWeight: '500' },
});

export default StudentDetailsScreen;
