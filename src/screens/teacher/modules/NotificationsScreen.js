import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '../../../theme';
import { Bell, CheckCircle, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock Data for now (until we connect the History API)
const MOCK_NOTIFICATIONS = [
    { id: '1', title: 'Exam Schedule Updated', message: 'The dates for Class X exams have been revised.', time: '2 hrs ago', read: false, type: 'alert' },
    { id: '2', title: 'Salary Credited', message: 'Your salary for December has been credited.', time: '1 day ago', read: true, type: 'success' },
    { id: '3', title: 'Meeting Reminder', message: 'Staff meeting at 3:00 PM today.', time: '2 days ago', read: true, type: 'info' },
];

import { PushNotificationService } from '../../../services/PushNotificationService';

const NotificationsScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate fetch
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleTestNotification = async () => {
        await PushNotificationService.triggerLocalNotification();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={[
            styles.card,
            { backgroundColor: item.read ? theme.background : theme.surface, borderColor: theme.border }
        ]}>
            <View style={[styles.iconBox, { backgroundColor: item.read ? theme.border : theme.primary + '20' }]}>
                <Bell size={20} color={item.read ? theme.textSecondary : theme.primary} />
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.textPrimary, fontWeight: item.read ? '500' : '700' }]}>
                        {item.title}
                    </Text>
                    <Text style={[styles.time, { color: theme.textSecondary }]}>{item.time}</Text>
                </View>
                <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
            {!item.read && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient
                colors={[theme.primary, theme.primaryDark || theme.primary]}
                style={styles.headerGradient}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <TouchableOpacity onPress={handleTestNotification} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: 8 }}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Test Alert</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Bell size={48} color={theme.textSecondary} style={{ opacity: 0.5 }} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No notifications yet</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
    },
    time: {
        fontSize: 12,
    },
    message: {
        fontSize: 14,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    empty: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    }
});

export default NotificationsScreen;
