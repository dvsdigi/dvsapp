// Theme Colors for DVS Mobile App
// Supports Dark and Light modes

export const colors = {
    dark: {
        // Backgrounds
        background: '#0f172a',
        backgroundSecondary: '#1e293b',
        backgroundTertiary: '#334155',

        // Surfaces / Cards
        surface: 'rgba(30, 41, 59, 0.6)',
        surfaceBorder: 'rgba(255, 255, 255, 0.1)',

        // Text
        textPrimary: '#ffffff',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',

        // Accents
        primary: '#6366f1',
        primaryLight: '#818cf8',
        secondary: '#7c3aed',

        // Gradients
        gradientStart: '#4f46e5',
        gradientEnd: '#7c3aed',

        // Status
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',

        // Orbs/Decorative
        orbPrimary: '#4f46e5',
        orbSecondary: '#c026d3',
    },
    light: {
        // Backgrounds
        background: '#f8fafc',
        backgroundSecondary: '#e2e8f0',
        backgroundTertiary: '#cbd5e1',

        // Surfaces / Cards
        surface: 'rgba(255, 255, 255, 0.9)',
        surfaceBorder: 'rgba(0, 0, 0, 0.1)',

        // Text
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#94a3b8',

        // Accents
        primary: '#4f46e5',
        primaryLight: '#6366f1',
        secondary: '#7c3aed',

        // Gradients
        gradientStart: '#6366f1',
        gradientEnd: '#8b5cf6',

        // Status
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',

        // Orbs/Decorative
        orbPrimary: '#6366f1',
        orbSecondary: '#a855f7',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
};

export const typography = {
    h1: { fontSize: 32, fontWeight: '800' },
    h2: { fontSize: 28, fontWeight: '700' },
    h3: { fontSize: 24, fontWeight: '700' },
    body: { fontSize: 16, fontWeight: '400' },
    caption: { fontSize: 14, fontWeight: '400' },
    button: { fontSize: 18, fontWeight: '700' },
};
