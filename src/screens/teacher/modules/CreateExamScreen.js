import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    Alert, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { useTheme } from '../../../theme';
import { teacherApi } from '../../../api/teacherApi';
import { useAuth } from '../../../context/AuthContext';
import { Calendar, CheckCircle, ChevronDown, Save, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const EXAM_TYPES = [
    "Unit Test", "Mid Term", "Final Term", "Weekly Test",
    "Monthly Test", "Assessment", "Project", "Practical"
];

const DEFAULT_SUBJECTS = [
    "Mathematics", "English", "Science", "Social Studies", "Hindi",
    "Computer Science", "Physical Education", "Art", "Music"
];

const CreateExamScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const { userInfo } = useAuth();
    const { isEdit, examData } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [fetchingSubjects, setFetchingSubjects] = useState((!isEdit));
    const [availableSubjects, setAvailableSubjects] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        examType: 'Unit Test',
        startDate: new Date(),
        endDate: new Date(),
        resultPublishDate: new Date(),
        totalMarks: '100',
        passingMarks: '35',
        instructions: '',
        selectedSubjects: []
    });

    // Pickers
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showResultPicker, setShowResultPicker] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);

    useEffect(() => {
        fetchSubjects();
        if (isEdit && examData) {
            populateForm(examData);
        }
    }, []);

    const fetchSubjects = async () => {
        try {
            const classId = userInfo?.classTeacher;
            const sectionId = userInfo?.section;

            // Try fetching from assignments first
            const response = await teacherApi.getAssignments(classId, sectionId);
            if (response && response.success && response.allAssignment) {
                const unique = [...new Set(response.allAssignment.map(item => item.subject))].filter(Boolean);
                if (unique.length > 0) {
                    setAvailableSubjects(unique);
                    return;
                }
            }
            // Fallback
            setAvailableSubjects(DEFAULT_SUBJECTS);
        } catch (error) {
            console.log("Subject fetch failed, using defaults", error);
            setAvailableSubjects(DEFAULT_SUBJECTS);
        } finally {
            setFetchingSubjects(false);
        }
    };

    const populateForm = (data) => {
        // Parse dates safely
        const parse = (d) => {
            if (!d) return new Date();
            // Handle DD-MM-YYYY if present
            if (typeof d === 'string' && d.includes('-') && d.split('-')[0].length === 2) {
                const [day, month, year] = d.split('-');
                return new Date(`${year}-${month}-${day}`);
            }
            return new Date(d);
        };

        const subjects = data.subjects?.map(s => s.name || s.subjectName) || [];
        const firstSub = data.subjects?.[0]; // Assume uniform marks for now

        setFormData({
            name: data.name,
            examType: data.examType,
            startDate: parse(data.startDate),
            endDate: parse(data.endDate),
            resultPublishDate: parse(data.resultPublishDate),
            totalMarks: firstSub ? String(firstSub.assessments?.[0]?.totalMarks || firstSub.totalMarks) : '100',
            passingMarks: firstSub ? String(firstSub.assessments?.[0]?.passingMarks || firstSub.passingMarks) : '35',
            instructions: '', // API doesn't seem to return instructions in list view
            selectedSubjects: subjects
        });
    };

    const handleSave = async () => {
        if (!formData.name || formData.selectedSubjects.length === 0) {
            Alert.alert("Error", "Please enter Exam Name and select at least one Subject.");
            return;
        }

        setLoading(true);
        try {
            const formatDate = (d) => d.toISOString().split('T')[0]; // YYYY-MM-DD

            const payload = {
                name: formData.name,
                examType: formData.examType,
                term: formData.examType,
                classNames: [userInfo?.classTeacher || "IV"],
                sections: [userInfo?.section || "A"],
                startDate: formatDate(formData.startDate),
                endDate: formatDate(formData.endDate),
                resultPublishDate: formatDate(formData.resultPublishDate),
                subjects: formData.selectedSubjects.map(sub => ({
                    name: sub,
                    assessments: [{
                        name: formData.name,
                        totalMarks: Number(formData.totalMarks),
                        passingMarks: Number(formData.passingMarks),
                        examDate: formatDate(formData.startDate),
                        startTime: formData.startDate, // Sending Date object, backend might need formatting but web client sent Date
                        endTime: formData.endDate
                    }]
                })),
                gradeSystem: "Standard"
            };

            let response;
            if (isEdit) {
                response = await teacherApi.updateExam(examData._id, payload);
            } else {
                response = await teacherApi.createExam(payload);
            }

            if (response && response.success) {
                Alert.alert("Success", `Exam ${isEdit ? 'updated' : 'created'} successfully!`, [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", response?.message || "Operation failed");
            }

        } catch (error) {
            console.error("Save failed", error);
            Alert.alert("Error", "Failed to save exam. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleSubject = (sub) => {
        setFormData(prev => {
            const current = prev.selectedSubjects;
            if (current.includes(sub)) {
                return { ...prev, selectedSubjects: current.filter(s => s !== sub) };
            } else {
                return { ...prev, selectedSubjects: [...current, sub] };
            }
        });
    };

    const DateInput = ({ label, date, onPress }) => (
        <TouchableOpacity style={[styles.inputGroup, { borderBottomColor: theme.border }]} onPress={onPress}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
            <View style={styles.dateRow}>
                <Text style={[styles.dateText, { color: theme.textPrimary }]}>
                    {date.toLocaleDateString()}
                </Text>
                <Calendar size={20} color={theme.primary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <X size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                    {isEdit ? 'Edit Exam' : 'Create Exam'}
                </Text>
                <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
                    {loading ? <ActivityIndicator color="#fff" size="small" /> : <Save size={20} color="#fff" />}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Basic Info */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>Basic Details</Text>

                    <View style={[styles.inputGroup, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Exam Name *</Text>
                        <TextInput
                            style={[styles.input, { color: theme.textPrimary }]}
                            value={formData.name}
                            onChangeText={t => setFormData({ ...formData, name: t })}
                            placeholder="e.g. Mid Term 2025"
                            placeholderTextColor={theme.textSecondary}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.inputGroup, { borderBottomColor: theme.border }]}
                        onPress={() => setShowTypeModal(true)}
                    >
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Exam Type *</Text>
                        <View style={styles.dateRow}>
                            <Text style={[styles.dateText, { color: theme.textPrimary }]}>{formData.examType}</Text>
                            <ChevronDown size={20} color={theme.textSecondary} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Dates */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>Schedule</Text>
                    <DateInput label="Start Date" date={formData.startDate} onPress={() => setShowStartPicker(true)} />
                    <DateInput label="End Date" date={formData.endDate} onPress={() => setShowEndPicker(true)} />
                    <DateInput label="Result Date" date={formData.resultPublishDate} onPress={() => setShowResultPicker(true)} />
                </View>

                {/* Marks */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>Marking Scheme</Text>
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, borderBottomColor: theme.border, marginRight: 8 }]}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Total Marks</Text>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={formData.totalMarks}
                                onChangeText={t => setFormData({ ...formData, totalMarks: t })}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, borderBottomColor: theme.border, marginLeft: 8 }]}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Passing Marks</Text>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={formData.passingMarks}
                                onChangeText={t => setFormData({ ...formData, passingMarks: t })}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                {/* Subjects */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>Subjects *</Text>
                    <Text style={[styles.subTitle, { color: theme.textSecondary }]}>
                        Select subjects included in this exam
                    </Text>

                    <View style={styles.subjectsGrid}>
                        {availableSubjects.map((sub, idx) => {
                            const isSelected = formData.selectedSubjects.includes(sub);
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.subjectBadge,
                                        {
                                            backgroundColor: isSelected ? theme.primary : theme.surfaceBorder,
                                            borderColor: isSelected ? theme.primary : theme.border
                                        }
                                    ]}
                                    onPress={() => toggleSubject(sub)}
                                >
                                    <Text style={[
                                        styles.subjectText,
                                        { color: isSelected ? '#fff' : theme.textPrimary }
                                    ]}>{sub}</Text>
                                    {isSelected && <CheckCircle size={12} color="#fff" style={{ marginLeft: 4 }} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

            </ScrollView>

            {/* DateTime Pickers */}
            {showStartPicker && (
                <DateTimePicker
                    value={formData.startDate}
                    mode="date"
                    onChange={(e, d) => { setShowStartPicker(false); if (d) setFormData({ ...formData, startDate: d }) }}
                />
            )}
            {showEndPicker && (
                <DateTimePicker
                    value={formData.endDate}
                    mode="date"
                    onChange={(e, d) => { setShowEndPicker(false); if (d) setFormData({ ...formData, endDate: d }) }}
                />
            )}
            {showResultPicker && (
                <DateTimePicker
                    value={formData.resultPublishDate}
                    mode="date"
                    onChange={(e, d) => { setShowResultPicker(false); if (d) setFormData({ ...formData, resultPublishDate: d }) }}
                />
            )}

            {/* Exam Type Modal */}
            <Modal visible={showTypeModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Select Exam Type</Text>
                        {EXAM_TYPES.map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.modalItem, { borderBottomColor: theme.border }]}
                                onPress={() => {
                                    setFormData({ ...formData, examType: type });
                                    setShowTypeModal(false);
                                }}
                            >
                                <Text style={{ color: theme.textPrimary }}>{type}</Text>
                                {formData.examType === type && <CheckCircle size={16} color={theme.primary} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles.closeModalBtn, { backgroundColor: theme.surfaceBorder }]}
                            onPress={() => setShowTypeModal(false)}
                        >
                            <Text style={{ color: theme.textPrimary }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 50,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    saveBtn: {
        backgroundColor: '#4f46e5',
        padding: 8,
        borderRadius: 8,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: { padding: 16 },
    section: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    subTitle: { fontSize: 12, marginBottom: 12 },
    inputGroup: {
        marginBottom: 16,
        borderBottomWidth: 1,
        paddingBottom: 8,
    },
    label: { fontSize: 12, marginBottom: 4 },
    input: { fontSize: 16, padding: 0 },
    dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dateText: { fontSize: 16 },
    row: { flexDirection: 'row' },
    subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    subjectBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    subjectText: { fontSize: 12, fontWeight: '500' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    closeModalBtn: {
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
});

export default CreateExamScreen;
