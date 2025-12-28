import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../theme';

const ThemeToggle = ({ style }) => {
    const { isDarkMode, toggleTheme, theme } = useTheme();
    const rotateAnim = useRef(new Animated.Value(isDarkMode ? 0 : 1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(rotateAnim, {
                toValue: isDarkMode ? 0 : 1,
                useNativeDriver: true,
                friction: 5,
            }),
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    friction: 3,
                }),
            ]),
        ]).start();
    }, [isDarkMode]);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <TouchableOpacity
            onPress={toggleTheme}
            style={[
                styles.container,
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                style,
            ]}
            activeOpacity={0.7}
        >
            <Animated.View style={{ transform: [{ rotate: rotation }, { scale: scaleAnim }] }}>
                {isDarkMode ? (
                    <Moon color={theme.textPrimary} size={22} />
                ) : (
                    <Sun color={theme.textPrimary} size={22} />
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ThemeToggle;
