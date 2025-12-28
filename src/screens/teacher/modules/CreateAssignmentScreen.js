import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import { useTheme } from '../../../theme';
import { teacherApi } from '../../../api/teacherApi';
import { useAuth } from '../../../context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Upload, Check, ChevronDown } from 'lucide-react-native';

const CreateAssignmentScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { userInfo } = useAuth();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [dueDate, setDueDate] = useState(new Date());
    const [selectedFile, setSelectedFile] = useState(null);
    const [subjects, setSubjects] = useState([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [fetchingSubjects, setFetchingSubjects] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await teacherApi.getAllClasses();
            // response.classes is array. Find class matching teacher's class
            if (response && response.classes) {
                const myClass = response.classes.find(c => c.className === userInfo?.classTeacher);
                if (myClass && myClass.subjects) {
                    let subjectList = [];
                    if (Array.isArray(myClass.subjects)) {
                        subjectList = myClass.subjects;
                    } else if (typeof myClass.subjects === 'string') {
                        subjectList = myClass.subjects.split(',').map(s => s.trim());
                    }
                    setSubjects(subjectList);
                }
            }
        } catch (error) {
            console.error("Failed to fetch subjects", error);
            Alert.alert("Error", "Could not load subjects.");
        } finally {
            setFetchingSubjects(false);
        }
    };

    const handleFilePick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                setSelectedFile({
                    uri: asset.uri,
                    name: asset.name,
                    mimeType: asset.mimeType,
                    size: asset.size
                });
            }
        } catch (err) {
            console.warn(err);
            Alert.alert("Error", "Failed to pick file.");
        }
    };

    const handleCreate = async () => {
        if (!title || !description || !selectedSubject) {
            Alert.alert("Missing Fields", "Please fill Title, Description and Subject.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('dueDate', dueDate.toISOString().split('T')[0]); // YYYY-MM-DD
            formData.append('className', userInfo?.classTeacher || "IV");
            formData.append('section', userInfo?.section || "A");
            formData.append('subject', selectedSubject);

            if (selectedFile) {
                formData.append('image', {
                    uri: selectedFile.uri,
                    name: selectedFile.name,
                    type: selectedFile.mimeType || 'application/pdf'
                });
            }

            const response = await teacherApi.createAssignment(formData);

            if (response && response.success) {
                Alert.alert("Success", "Assignment Created!", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", response?.message || "Failed to create assignment.");
            }

        } catch (error) {
            console.error("Create Assignment Error", error);
            Alert.alert("Error", "Failed to create assignment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ padding: 20 }}>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Title *</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Chapter 5 Exercises"
                placeholderTextColor={theme.textSecondary + '80'}
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>Description *</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border, height: 100, textAlignVertical: 'top' }]}
                value={description}
                onChangeText={setDescription}
                multiline
                placeholder="Instructions for students..."
                placeholderTextColor={theme.textSecondary + '80'}
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>Subject *</Text>
            <TouchableOpacity
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
            >
                <Text style={{ color: selectedSubject ? theme.textPrimary : theme.textSecondary + '80' }}>
                    {selectedSubject || "Select Subject"}
                </Text>
                <ChevronDown size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {showSubjectDropdown && (
                <View style={[styles.dropdown, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {fetchingSubjects ? (
                        <ActivityIndicator size="small" color={theme.primary} style={{ padding: 10 }} />
                    ) : (
                        subjects.map((sub, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.dropdownItem}
                                onPress={() => { setSelectedSubject(sub); setShowSubjectDropdown(false); }}
                            >
                                <Text style={{ color: theme.textPrimary }}>{sub}</Text>
                                {selectedSubject === sub && <Check size={16} color={theme.primary} />}
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            )}

            <Text style={[styles.label, { color: theme.textSecondary }]}>Due Date</Text>
            <TouchableOpacity
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', gap: 10 }]}
                onPress={() => setShowDatePicker(true)}
            >
                <Calendar size={20} color={theme.textSecondary} />
                <Text style={{ color: theme.textPrimary }}>
                    {dueDate.toDateString()}
                </Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDueDate(selectedDate);
                    }}
                    minimumDate={new Date()}
                />
            )}

            <Text style={[styles.label, { color: theme.textSecondary }]}>Attachment (PDF)</Text>
            <TouchableOpacity
                style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: theme.surface }]}
                onPress={handleFilePick}
            >
                {selectedFile ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Check size={24} color="#16a34a" />
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.textPrimary, fontWeight: 'bold' }} numberOfLines={1}>{selectedFile.name}</Text>
                            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{(selectedFile.size / 1024).toFixed(1)} KB</Text>
                        </View>
                    </View>
                ) : (
                    <View style={{ alignItems: 'center', gap: 8 }}>
                        <Upload size={32} color={theme.primary} />
                        <Text style={{ color: theme.textSecondary }}>Tap to upload PDF</Text>
                    </View>
                )}
            </TouchableOpacity>


            <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
                onPress={handleCreate}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.btnText}>Create Assignment</Text>
                )}
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    dropdown: {
        borderWidth: 1,
        borderRadius: 12,
        marginTop: 4,
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.1)'
    },
    uploadBox: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 24,
        justifyContent: 'center',
    },
    submitBtn: {
        marginTop: 40,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 40,
        elevation: 4
    },
    btnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default CreateAssignmentScreen;
