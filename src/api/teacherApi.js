import apiClient from './apiClient';
import { API_URL } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const teacherApi = {
    // Get all students for a class/section
    getAllStudents: async (classId, sectionId) => {
        try {
            // Updated to match server route: /api/v1/adminRoute/studentparent
            const response = await apiClient.get(`/adminRoute/studentparent?class=${classId}&section=${sectionId}&status=active`);
            console.log("TeacherAPI - getAllStudents Raw Response:", JSON.stringify(response.data).substring(0, 200) + "...");

            // Web client structure: response.students.data
            // Axios returns data in response.data
            if (response.data?.success && response.data?.students?.data) {
                return response.data.students.data;
            }
            return []; // Return empty array if structure doesn't match
        } catch (error) {
            console.error("Error fetching students:", error);
            throw error;
        }
    },

    updateStudent: async (studentId, studentData) => {
        try {
            console.log(`TeacherApi: Updating student ${studentId}`, studentData);
            // Matches web client: PUT /adminRoute/students/:studentId
            const response = await apiClient.put(`/adminRoute/students/${studentId}`, studentData);
            return response.data;
        } catch (error) {
            console.error("Error updating student:", error);
            throw error;
        }
    },

    // --- Attendance (My Attendance) ---
    getAttendanceStatus: async () => {
        try {
            const response = await apiClient.get('/attendance/status/today');
            return response.data;
        } catch (error) {
            console.error("Error getting attendance status:", error);
            throw error;
        }
    },

    clockIn: async (payload) => {
        try {
            const response = await apiClient.post('/attendance/clock-in', payload);
            return response.data;
        } catch (error) {
            console.error("Error clocking in:", error);
            throw error;
        }
    },

    clockOut: async (payload) => {
        try {
            const response = await apiClient.post('/attendance/clock-out', payload);
            return response.data;
        } catch (error) {
            console.error("Error clocking out:", error);
            throw error;
        }
    },

    getAttendanceActivity: async (date, status = "") => {
        try {
            let query = `?date=${date}`;
            if (status) query += `&status=${status}`;
            const response = await apiClient.get(`/attendance/activity${query}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching activity log:", error);
            throw error;
        }
    },

    // --- Student Attendance ---
    submitStudentAttendance: async (payload) => {
        try {
            // Endpoint from web client: createAttendance -> teacher/createAttendance
            const response = await apiClient.post('/teacher/createAttendance', payload);
            return response.data;
        } catch (error) {
            console.error("Error submitting student attendance:", error);
            throw error;
        }
    },

    getStudentAttendance: async (year, month) => {
        try {
            const response = await apiClient.get('/teacher/getAttendance', {
                params: { year, month }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching student attendance:", error);
            throw error;
        }
    },

    // Get Exams
    getExams: async (classId, sectionId) => {
        try {
            // Updated to match server route: /api/v1/exam/exams
            const response = await apiClient.get(`/exam/exams?className=${classId}&section=${sectionId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching exams:", error);
            throw error;
        }
    },



    // Get Marks
    getMarks: async (classId, sectionId) => {
        try {
            const response = await apiClient.get(`/marks/marksmarks?className=${classId}&section=${sectionId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching marks:", error);
            throw error;
        }
    },

    // --- Assignments ---
    getAllClasses: async () => {
        try {
            const response = await apiClient.get('/adminRoute/class');
            return response.data;
        } catch (error) {
            console.error("Error fetching classes:", error);
            throw error;
        }
    },

    getAssignments: async () => {
        try {
            const response = await apiClient.get('/teacher/getAllAssignment');
            return response.data;
        } catch (error) {
            console.error("Error fetching assignments:", error);
            throw error;
        }
    },

    createAssignment: async (formData) => {
        try {
            console.log("Using native fetch for multipart upload...");
            const token = await AsyncStorage.getItem('userToken');

            // Bypass Axios and use native Fetch for reliable FormData handling
            const response = await fetch(`${API_URL}/adminRoute/task`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Explicitly DO NOT set Content-Type here; fetch sets it with boundary automatically
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("Fetch error:", JSON.stringify(result));
                throw new Error(result.message || "Failed to create assignment");
            }

            return result;
        } catch (error) {
            console.error("Error creating assignment (Fetch):", error);
            throw error;
        }
    },

    deleteAssignment: async (id) => {
        try {
            const response = await apiClient.delete(`/adminRoute/task/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting assignment:", error);
            throw error;
        }
    },

    // --- Lectures / Timetable ---
    getClassTimeTable: async (className, section) => {
        try {
            const response = await apiClient.get(`/timeTable/getClassTimeTable?className=${className}&section=${section}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching timetable:", error);
            throw error;
        }
    },

    createClassTimeTable: async (timetableData) => {
        try {
            const response = await apiClient.post('/timeTable/createClassTimeTable', timetableData);
            return response.data;
        } catch (error) {
            console.error("Error creating timetable:", error);
            throw error;
        }
    },

    deleteClassTimeTable: async (id) => {
        try {
            const response = await apiClient.delete(`/timeTable/deleteClassTimeTable/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting timetable:", error);
            throw error;
        }
    }
};
