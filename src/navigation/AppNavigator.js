import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import { StatusBar } from 'expo-status-bar';

// Auth Screens
import HomeScreen from '../screens/HomeScreen';
import LoginSelectionScreen from '../screens/LoginSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import TeacherNavigator from './TeacherNavigator';

const Stack = createStackNavigator();

// Placeholder Dashboard
const DashboardScreen = ({ navigation }) => {
    const { logout, userRole, userInfo } = useAuth();
    const { theme, isDarkMode } = useTheme();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
            <Text style={{ color: theme.textPrimary, fontSize: 24, marginBottom: 20 }}>Welcome, {userRole}!</Text>
            <Text style={{ color: theme.textSecondary, marginBottom: 40 }}>{userInfo?.email}</Text>
            <Text style={{ color: theme.primary, marginBottom: 20, fontWeight: 'bold' }}>
                Dashboard UI Coming Soon
            </Text>
            <TouchableOpacity onPress={logout}>
                <Text style={{ color: theme.error, fontSize: 16, fontWeight: '600' }}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};


// Auth Stack
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LoginSelection" component={LoginSelectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
);

// App Stack (Dashboard)
const AppStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    const { userToken, isLoading, userRole } = useAuth();
    const { theme, isDarkMode } = useTheme();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    // Role-based Navigation
    return (
        <NavigationContainer>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            {!userToken ? (
                <AuthStack />
            ) : userRole === 'teacher' ? (
                <TeacherNavigator />
            ) : (
                <AppStack />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
