import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Menu, Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../theme';
import TeacherSidebar from '../screens/teacher/TeacherSidebar';
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import MyStudentsScreen from '../screens/teacher/modules/MyStudentsScreen';
import AttendanceScreen from '../screens/teacher/modules/AttendanceScreen';

import {
    StudyScreen, CurriculumScreen, PayrollScreen,
    AIFeaturesScreen
} from '../screens/teacher/TeacherModules';
import AssignmentsListScreen from '../screens/teacher/modules/AssignmentsListScreen';
import CreateAssignmentScreen from '../screens/teacher/modules/CreateAssignmentScreen';
import AssignmentDetailsScreen from '../screens/teacher/modules/AssignmentDetailsScreen';
import AboutMeScreen from '../screens/teacher/modules/AboutMeScreen';
import LecturesScreen from '../screens/teacher/modules/LecturesScreen';
import CreateExamScreen from '../screens/teacher/modules/CreateExamScreen';
import ExamsScreen from '../screens/teacher/modules/ExamsScreen';

const Stack = createStackNavigator();

// Higher Order Component to wrap screens with Sidebar & Common Layout
// This ensures every screen has a Menu button and Sidebar logic
const Wrap = (Component, routeName) => {
    return ({ navigation }) => {
        const { theme, toggleTheme, isDarkMode } = useTheme();
        const [sidebarVisible, setSidebarVisible] = useState(false);

        return (
            <View style={{ flex: 1, backgroundColor: theme.background }}>
                {/* Custom Header for Modules (Not Dashboard) */}
                {routeName !== 'Dashboard' && (
                    <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuBtn}>
                                <Menu color={theme.textPrimary} size={24} />
                            </TouchableOpacity>
                            <Text style={[styles.headerTitle, { color: theme.textPrimary, marginLeft: 10 }]}>{routeName.replace(/([A-Z])/g, ' $1').trim()}</Text>
                        </View>

                        {/* Theme Toggle */}
                        <TouchableOpacity onPress={toggleTheme} style={styles.menuBtn}>
                            {isDarkMode ? <Sun color={theme.textPrimary} size={24} /> : <Moon color={theme.textPrimary} size={24} />}
                        </TouchableOpacity>
                    </View>
                )}

                <Component navigation={navigation} openSidebar={() => setSidebarVisible(true)} />

                <TeacherSidebar
                    visible={sidebarVisible}
                    onClose={() => setSidebarVisible(false)}
                    onNavigate={navigation.navigate}
                    activeRoute={routeName}
                />
            </View>
        );
    }
};

// Define Wrapped Components outside
const WrappedDashboard = Wrap(TeacherDashboardScreen, 'Dashboard');
const WrappedMyStudents = Wrap(MyStudentsScreen, 'MyStudents');
const WrappedAttendance = Wrap(AttendanceScreen, 'Attendance');
const WrappedAssignmentsList = Wrap(AssignmentsListScreen, 'Assignments');
const WrappedExams = Wrap(ExamsScreen, 'Exams');
const WrappedLectures = Wrap(LecturesScreen, 'Lectures');
const WrappedStudy = Wrap(StudyScreen, 'Study');
const WrappedCurriculum = Wrap(CurriculumScreen, 'Curriculum');
const WrappedPayroll = Wrap(PayrollScreen, 'Payroll');
const WrappedAIFeatures = Wrap(AIFeaturesScreen, 'AIFeatures');
const WrappedAboutMe = Wrap(AboutMeScreen, 'AboutMe');

// No Wrap for these, they should look like full screens or modals
import StudentDetailsScreen from '../screens/teacher/modules/StudentDetailsScreen';
import EditStudentScreen from '../screens/teacher/modules/EditStudentScreen';


const TeacherNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Dashboard">
            <Stack.Screen name="Dashboard" component={WrappedDashboard} />

            {/* Modules - Each wrapped with sidebar access logic */}
            <Stack.Screen name="MyStudents" component={WrappedMyStudents} />
            <Stack.Screen name="Attendance" component={WrappedAttendance} />
            <Stack.Screen name="AssignmentsList" component={WrappedAssignmentsList} />
            <Stack.Screen
                name="CreateAssignment"
                component={CreateAssignmentScreen}
                options={{ headerShown: true, title: "Create Assignment" }}
            />
            <Stack.Screen
                name="AssignmentDetails"
                component={AssignmentDetailsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="Exams" component={WrappedExams} />
            <Stack.Screen
                name="CreateExam"
                component={CreateExamScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="Lectures" component={WrappedLectures} />
            <Stack.Screen name="Study" component={WrappedStudy} />
            <Stack.Screen name="Curriculum" component={WrappedCurriculum} />
            <Stack.Screen name="Payroll" component={WrappedPayroll} />
            <Stack.Screen name="AIFeatures" component={WrappedAIFeatures} />
            <Stack.Screen name="AboutMe" component={WrappedAboutMe} />

            {/* Sub-Screens (No Sidebar Wrap for cleaner "Detail" feel) */}
            <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
            <Stack.Screen name="EditStudent" component={EditStudentScreen} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 0,
        marginTop: 30, // Rough status bar gap
        borderBottomWidth: 1,
    },
    menuBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default TeacherNavigator;
