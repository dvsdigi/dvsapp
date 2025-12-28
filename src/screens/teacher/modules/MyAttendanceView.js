import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    Platform
} from 'react-native';
import { useTheme } from '../../../theme';
import { teacherApi } from '../../../api/teacherApi';
import * as Location from 'expo-location';
import { MapPin, Clock, RotateCw, AlertTriangle, CheckCircle } from 'lucide-react-native';

const MyAttendanceView = () => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [statusData, setStatusData] = useState(null); // { status: 'Present' | 'Absent', clockInTime, clockOutTime }
    const [logs, setLogs] = useState([]);
    const [locationMsg, setLocationMsg] = useState(null);

    useEffect(() => {
        fetchStatus();
        fetchLogs();
    }, []);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const data = await teacherApi.getAttendanceStatus();
            if (data && data.success) {
                setStatusData(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch status", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const data = await teacherApi.getAttendanceActivity(today);
            if (data && data.success) {
                setLogs(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        }
    };

    const handleClockIn = async () => {
        setLoading(true);
        setLocationMsg("Getting Location...");
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to clock in.');
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const { latitude, longitude, accuracy } = location.coords;

            setLocationMsg(null);

            const payload = {
                latitude,
                longitude,
                accuracy,
                address: "Mobile GPS"
            };

            const response = await teacherApi.clockIn(payload);
            if (response.success) {
                Alert.alert("Success", "Clocked In Successfully!");
                fetchStatus();
                fetchLogs();
            } else {
                Alert.alert("Clock In Failed", response.message || "Unknown error");
            }

        } catch (error) {
            console.error(error);
            // Handle Geofencing 403 specifically if possible, or generic error
            if (error.response?.status === 403) {
                Alert.alert("Out of Range", "You are not within the office/school geofence.");
            } else {
                Alert.alert("Error", "Failed to Clock In. Check GPS/Network.");
            }
        } finally {
            setLoading(false);
            setLocationMsg(null);
        }
    };

    const handleClockOut = async () => {
        setLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location needed for clock out.');
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude, accuracy } = location.coords;

            const payload = { latitude, longitude, accuracy };

            const response = await teacherApi.clockOut(payload);
            if (response.success) {
                Alert.alert("Success", "Clocked Out Successfully!");
                fetchStatus();
                fetchLogs();
            } else {
                Alert.alert("Failed", response.message);
            }

        } catch (error) {
            Alert.alert("Error", "Clock Out Failed.");
        } finally {
            setLoading(false);
        }
    };

    const isClockedIn = statusData?.status === 'Present';
    const isClockedOut = !!statusData?.clockOutTime;

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: 40 }}>

            {/* Status Card */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>Today's Status</Text>
                    {isClockedIn && !isClockedOut ? (
                        <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                            <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: 'bold' }}>Active</Text>
                        </View>
                    ) : (
                        <View style={[styles.badge, { backgroundColor: theme.surfaceBorder }]}>
                            <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: 'bold' }}>
                                {isClockedOut ? "Completed" : "Inactive"}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Clock Times */}
                <View style={styles.timeRow}>
                    <View style={styles.timeItem}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Clock In</Text>
                        <Text style={[styles.timeVal, { color: theme.textPrimary }]}>
                            {statusData?.clockInTime ? new Date(statusData.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.timeItem}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Clock Out</Text>
                        <Text style={[styles.timeVal, { color: theme.textPrimary }]}>
                            {statusData?.clockOutTime ? new Date(statusData.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </Text>
                    </View>
                </View>

                {/* Main Action Button */}
                {loading ? (
                    <View style={styles.loaderArea}>
                        <ActivityIndicator color={theme.primary} size="large" />
                        {locationMsg && <Text style={{ color: theme.textSecondary, marginTop: 8 }}>{locationMsg}</Text>}
                    </View>
                ) : (
                    <>
                        {!isClockedIn ? (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                                onPress={handleClockIn}
                            >
                                <MapPin color="#FFF" size={24} style={{ marginRight: 8 }} />
                                <Text style={styles.btnText}>Clock In (GPS)</Text>
                            </TouchableOpacity>
                        ) : !isClockedOut ? (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#dc2626' }]}
                                onPress={handleClockOut}
                            >
                                <CustomIcon name="LogOut" color="#FFF" />
                                <Text style={styles.btnText}>Clock Out</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={[styles.completeBox, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                                <CheckCircle color="#16a34a" size={24} />
                                <Text style={{ color: '#15803d', fontWeight: '600', marginLeft: 8 }}>Shift Completed</Text>
                            </View>
                        )}
                    </>
                )}
            </View>

            {/* Logs Section */}
            <View style={{ marginTop: 24, paddingHorizontal: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 12 }}>Request Log</Text>
                {logs.length === 0 ? (
                    <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>No activity records found.</Text>
                ) : (
                    logs.map((log, index) => (
                        <View key={index} style={[styles.logItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View>
                                <Text style={[styles.logDate, { color: theme.textPrimary }]}>
                                    {new Date(log.date).toDateString()}
                                </Text>
                                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{log.status}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: '#16a34a', fontWeight: '600', fontSize: 13 }}>In: {log.clockInTime ? new Date(log.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</Text>
                                <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 13 }}>Out: {log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

        </ScrollView>
    );
};

// Polyfill for icon if needed, or import from lucide
// Just using text logic above for specific icons
const CustomIcon = ({ name, color }) => {
    if (name === 'LogOut') return <RotateCw size={24} color={color} style={{ marginRight: 8 }} />; // temporary
    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 24,
    },
    timeItem: {
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: 40,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
    },
    timeVal: {
        fontSize: 18,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    actionBtn: {
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loaderArea: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    completeBox: {
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
    },
    logDate: {
        fontWeight: '600',
        marginBottom: 4,
    }
});

export default MyAttendanceView;
