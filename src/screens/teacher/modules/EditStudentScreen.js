import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useTheme } from '../../../theme';
import { teacherApi } from '../../../api/teacherApi';
import { ArrowLeft, Save } from 'lucide-react-native';

// --- Components Defined Outside to Prevent Re-renders/Focus Loss ---

const InputField = ({ label, value, onChangeText, theme, keyboardType = 'default', multiline = false, readOnly = false, placeholder }) => (
    <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
        <TextInput
            style={[
                styles.input,
                {
                    backgroundColor: readOnly ? theme.surfaceBorder : theme.surface,
                    color: readOnly ? theme.textSecondary : theme.textPrimary,
                    borderColor: theme.border,
                    height: multiline ? 80 : 50,
                    textAlignVertical: multiline ? 'top' : 'center'
                }
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder || `Enter ${label}`}
            placeholderTextColor={theme.textSecondary + '80'}
            keyboardType={keyboardType}
            multiline={multiline}
            editable={!readOnly}
        />
    </View>
);

const SectionHeader = ({ title, theme }) => (
    <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>{title}</Text>
        <View style={[styles.sectionLine, { backgroundColor: theme.border }]} />
    </View>
);

const GenderSelector = ({ value, onSelect, theme }) => (
    <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Gender</Text>
        <View style={styles.genderRow}>
            {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity
                    key={g}
                    style={[
                        styles.genderBtn,
                        {
                            backgroundColor: value === g ? theme.primary : theme.surface,
                            borderColor: value === g ? theme.primary : theme.border
                        }
                    ]}
                    onPress={() => onSelect(g)}
                >
                    <Text style={[
                        styles.genderText,
                        { color: value === g ? '#FFF' : theme.textSecondary }
                    ]}>{g}</Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

// --- Main Screen Component ---

const EditStudentScreen = ({ route, navigation }) => {
    const { student } = route.params;
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Personal
        studentName: student.studentName || '',
        email: student.email || '',
        contact: student.contact ? String(student.contact) : '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '', // YYYY-MM-DD
        gender: student.gender || '',
        religion: student.religion || '',
        caste: student.caste || '',
        nationality: student.nationality || '',

        // Academic
        admissionNumber: student.admissionNumber || '',
        rollNo: student.rollNo ? String(student.rollNo) : '',
        class: student.class || '',
        section: student.section || '',

        // Address
        address: student.address || '',
        city: student.city || '',
        state: student.state || '',
        country: student.country || '',
        pincode: student.pincode || '',

        // Parents
        fatherName: student.fatherName || '',
        motherName: student.motherName || '',
        guardian: student.guardian || '',
        parentContact: student.parentcontact ? String(student.parentcontact) : '',
        parentemail: student.parentemail || '',

        // Account
        password: '',
    });

    // Helper to update field
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const idToUpdate = student.studentId;
            const payload = {
                ...formData,
                studentId: idToUpdate,
            };

            console.log(`Updating Student (ID: ${idToUpdate}):`, payload);

            const response = await teacherApi.updateStudent(idToUpdate, payload);

            if (response?.success) {
                Alert.alert("Success", "Student details updated successfully", [
                    { text: "OK", onPress: () => navigation.navigate('MyStudents', { refresh: true }) }
                ]);
            } else {
                Alert.alert("Notice", response?.message || "Update processed with warnings.");
            }

        } catch (error) {
            console.error("Update failed", error);
            Alert.alert("Error", "Failed to update student details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, backgroundColor: theme.background }}
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.surface }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Edit Student</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Personal Information */}
                <SectionHeader title="Personal Information" theme={theme} />
                <InputField label="Student Name" value={formData.studentName} onChangeText={(t) => updateField('studentName', t)} theme={theme} />
                <InputField label="Email" value={formData.email} onChangeText={(t) => updateField('email', t)} keyboardType="email-address" theme={theme} />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <InputField label="Contact" value={formData.contact} onChangeText={(t) => updateField('contact', t)} keyboardType="phone-pad" theme={theme} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <InputField label="Date of Birth" value={formData.dateOfBirth} onChangeText={(t) => updateField('dateOfBirth', t)} placeholder="YYYY-MM-DD" theme={theme} />
                    </View>
                </View>

                <GenderSelector value={formData.gender} onSelect={(g) => updateField('gender', g)} theme={theme} />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <InputField label="Religion" value={formData.religion} onChangeText={(t) => updateField('religion', t)} theme={theme} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <InputField label="Caste" value={formData.caste} onChangeText={(t) => updateField('caste', t)} theme={theme} />
                    </View>
                </View>
                <InputField label="Nationality" value={formData.nationality} onChangeText={(t) => updateField('nationality', t)} theme={theme} />


                {/* Academic Information */}
                <SectionHeader title="Academic Information" theme={theme} />
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <InputField label="Admission No" value={formData.admissionNumber} readOnly theme={theme} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <InputField label="Roll No" value={formData.rollNo} onChangeText={(t) => updateField('rollNo', t)} theme={theme} />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <InputField label="Class" value={formData.class} readOnly theme={theme} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <InputField label="Section" value={formData.section} readOnly theme={theme} />
                    </View>
                </View>


                {/* Address Information */}
                <SectionHeader title="Address Details" theme={theme} />
                <InputField label="Address" value={formData.address} onChangeText={(t) => updateField('address', t)} multiline theme={theme} />
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <InputField label="City" value={formData.city} onChangeText={(t) => updateField('city', t)} theme={theme} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <InputField label="State" value={formData.state} onChangeText={(t) => updateField('state', t)} theme={theme} />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <InputField label="Country" value={formData.country} onChangeText={(t) => updateField('country', t)} theme={theme} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <InputField label="Pincode" value={formData.pincode} onChangeText={(t) => updateField('pincode', t)} keyboardType="numeric" theme={theme} />
                    </View>
                </View>


                {/* Parent Information */}
                <SectionHeader title="Parent Information" theme={theme} />
                <InputField label="Father's Name" value={formData.fatherName} onChangeText={(t) => updateField('fatherName', t)} theme={theme} />
                <InputField label="Mother's Name" value={formData.motherName} onChangeText={(t) => updateField('motherName', t)} theme={theme} />
                <InputField label="Guardian's Name" value={formData.guardian} onChangeText={(t) => updateField('guardian', t)} theme={theme} />
                <InputField label="Parent Contact" value={formData.parentContact} onChangeText={(t) => updateField('parentContact', t)} keyboardType="phone-pad" theme={theme} />
                <InputField label="Parent Email" value={formData.parentemail} onChangeText={(t) => updateField('parentemail', t)} keyboardType="email-address" theme={theme} />


                {/* Account Security */}
                <SectionHeader title="Account Security" theme={theme} />
                <InputField label="New Password (Leave empty)" value={formData.password} onChangeText={(t) => updateField('password', t)} placeholder="Enter new password" theme={theme} />


                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.saveBtnText}>Update Student</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        elevation: 2,
        marginTop: 30
    },
    backBtn: { padding: 8, marginRight: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginRight: 12,
    },
    sectionLine: {
        flex: 1,
        height: 1,
    },

    inputGroup: { marginBottom: 16 },
    label: { marginBottom: 8, fontSize: 13, fontWeight: '600' },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    row: { flexDirection: 'row' },

    genderRow: { flexDirection: 'row', gap: 10 },
    genderBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    genderText: { fontSize: 13, fontWeight: '600' },

    saveBtn: {
        flexDirection: 'row',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        elevation: 3,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 }
    },
    saveBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditStudentScreen;
