import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../config/apiConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [userRole, setUserRole] = useState(null);

    // Check if user is already logged in
    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let token = await AsyncStorage.getItem('userToken');
            let role = await AsyncStorage.getItem('userRole');
            let user = await AsyncStorage.getItem('userInfo'); // Store as string

            if (token) {
                setUserToken(token);
                setUserRole(role);
                setUserInfo(JSON.parse(user));
            }
        } catch (e) {
            console.log(`isLogged in error ${e}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    const login = async (role, username, password, session = null) => {
        setIsLoading(true);
        try {
            const payload = {
                email: username,
                password: password,
                role: role,
                session: session || ""
            };

            const response = await apiClient.post(ENDPOINTS.LOGIN, payload);
            const data = response.data;

            if (data?.success) {
                // Save data locally
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userRole', data.user.role);
                await AsyncStorage.setItem('userInfo', JSON.stringify(data.user)); // Save user object


                setUserToken(data.token);
                setUserRole(data.user.role);
                setUserInfo(data.user);

                return { success: true };
            } else {
                return { success: false, message: data?.message || "Login failed" };
            }

        } catch (error) {
            console.error("Login Implementation Error", error);
            return {
                success: false,
                message: error.response?.data?.message || "Network Error"
            };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setUserToken(null);
        setUserRole(null);
        setUserInfo(null);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userRole');
        await AsyncStorage.removeItem('userInfo');
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, userRole, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
