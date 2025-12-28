import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { teacherApi } from '../api/teacherApi';

// Send logic to handle notification behavior when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const PushNotificationService = {

    registerForPushNotificationsAsync: async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('PushNotificationService: Failed to get permission for push notification!');
                return;
            }

            // Check for Expo Go (Push Notifications not supported in SDK 53+ Expo Go)
            if (Constants.executionEnvironment === 'storeClient') {
                console.warn('⚠️ Push Notifications are NOT supported in Expo Go. Please use a Development Build.');
                return;
            }

            // Get the token
            try {
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                token = (await Notifications.getExpoPushTokenAsync({
                    projectId
                })).data;

                console.log('PushNotificationService: Expo Push Token:', token);

                // Send to backend
                if (token) {
                    await teacherApi.registerPushToken(token);
                }

            } catch (e) {
                console.error("PushNotificationService: Error getting token", e);
            }

        } else {
            console.log('PushNotificationService: Must use physical device for Push Notifications');
        }

        return token;
    },

    // Test function for Expo Go
    triggerLocalNotification: async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🔔 Test Notification",
                body: "This is how a notification will look! (Local Test)",
                data: { data: 'goes here' },
            },
            trigger: null, // show immediately
        });
    },

    // Listeners
    addNotificationListener: (callback) => {
        return Notifications.addNotificationReceivedListener(callback);
    },

    addResponseListener: (callback) => {
        return Notifications.addNotificationResponseReceivedListener(callback);
    },

    removeSubscription: (subscription) => {
        if (subscription) Notifications.removeNotificationSubscription(subscription);
    }
};
