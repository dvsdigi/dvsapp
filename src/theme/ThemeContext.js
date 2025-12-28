import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme preference
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('theme');
                if (savedTheme !== null) {
                    setIsDarkMode(savedTheme === 'dark');
                }
            } catch (error) {
                console.log('Error loading theme:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        try {
            await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const theme = isDarkMode ? colors.dark : colors.light;

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
