import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar
} from 'react-native';
import { useTheme } from '../../../theme';
import { ArrowLeft } from 'lucide-react-native';
import MyAttendanceView from './MyAttendanceView';
import StudentAttendanceView from './StudentAttendanceView';

const AttendanceScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('myAttendance'); // 'myAttendance' | 'studentAttendance'

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            {/* <View style={[styles.header, { backgroundColor: theme.surface }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Attendance Portal</Text>
            </View> */}

            {/* Custom Tab Bar */}
            <View style={styles.tabContainer}>
                <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
                    <TouchableOpacity
                        style={[
                            styles.tabBtn,
                            activeTab === 'myAttendance' && { backgroundColor: theme.primary }
                        ]}
                        onPress={() => setActiveTab('myAttendance')}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'myAttendance' ? '#FFF' : theme.textSecondary }
                        ]}>My Attendance</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tabBtn,
                            activeTab === 'studentAttendance' && { backgroundColor: theme.primary }
                        ]}
                        onPress={() => setActiveTab('studentAttendance')}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'studentAttendance' ? '#FFF' : theme.textSecondary }
                        ]}>Student Attendance</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tab Content */}
            <View style={styles.content}>
                {activeTab === 'myAttendance' ? (
                    <MyAttendanceView />
                ) : (
                    <StudentAttendanceView />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        elevation: 2,
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
    },
    backBtn: { padding: 8, marginRight: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },

    tabContainer: {
        padding: 16,
    },
    tabBar: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        elevation: 1,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabText: {
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        flex: 1,
    }
});

export default AttendanceScreen;
