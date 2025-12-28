import apiClient from './apiClient';

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

    // Create Attendance
    createAttendance: async (payload) => {
        try {
            const response = await apiClient.post(`/attendance/createattendance`, payload);
            return response.data;
        } catch (error) {
            console.error("Error creating attendance:", error);
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
    }
};
