import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

// Auth Screens
import HomeScreen from '../screens/HomeScreen';
import LoginSelectionScreen from '../screens/LoginSelectionScreen';
import LoginScreen from '../screens/LoginScreen';

const Stack = createStackNavigator();

// Placeholder Dashboard
const DashboardScreen = ({ navigation }) => {
    const { logout, userRole, userInfo } = useAuth();
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
            <Text style={{ color: '#fff', fontSize: 24, marginBottom: 20 }}>Welcome, {userRole}!</Text>
            <Text style={{ color: '#94a3b8', marginBottom: 40 }}>{userInfo?.email}</Text>
            <Text style={{ color: '#4f46e5', marginBottom: 20, fontWeight: 'bold', onPress: () => alert('Dashboard coming soon!') }}>
                Dashboard UI Pending
            </Text>
            <Text style={{ color: 'red', marginTop: 20 }} onPress={logout}>Logout</Text>
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
    const { userToken, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar style="light" />
            {userToken ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;
