import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Linking, Image, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme } from '../../theme';
import { Mail, Phone, MapPin, Globe, CreditCard, Users, BookOpen, BarChart3, Bus, FileText, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

// --- Components ---

const GradientText = ({ text, style }) => {
    const { theme, isDarkMode } = useTheme();
    // Simplified gradient text simulation (foreground color)
    return <Text style={[style, { color: theme.primary }]}>{text}</Text>;
}

// Reusable Vibrant Bento Card
const BentoCard = ({ icon: Icon, title, desc, delay, style, accentColor }) => {
    const { theme, isDarkMode } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            delay,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.bentoCardWrapper, style, { opacity: fadeAnim }]}>
            <LinearGradient
                colors={isDarkMode ? ['#1e293b', '#0f172a'] : ['#ffffff', '#f8fafc']}
                style={[styles.bentoCard, { borderColor: accentColor + '40' }]}
            >
                <View style={[styles.cardGlow, { backgroundColor: accentColor, opacity: isDarkMode ? 0.05 : 0.03 }]} />
                <View style={[styles.iconCircle, { backgroundColor: accentColor + '15' }]}>
                    <Icon color={accentColor} size={28} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.bentoTitle, { color: theme.textPrimary }]}>{title}</Text>
                    <Text style={[styles.bentoDesc, { color: theme.textSecondary }]} numberOfLines={2}>{desc}</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const FAQItem = ({ question, answer }) => {
    const [expanded, setExpanded] = useState(false);
    const { theme } = useTheme();

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={[styles.faqItem, { borderBottomColor: theme.surfaceBorder }]}>
            <TouchableOpacity onPress={toggleExpand} style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: theme.textPrimary }]}>{question}</Text>
                {expanded ? <ChevronUp color={theme.textSecondary} size={20} /> : <ChevronDown color={theme.textSecondary} size={20} />}
            </TouchableOpacity>
            {expanded && (
                <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>{answer}</Text>
            )}
        </View>
    );
};

// --- Views ---

export const FeaturesView = () => {
    const { theme } = useTheme();
    return (
        <View style={styles.fullScreenContainer}>
            <View style={styles.header}>
                <Text style={[styles.bigTitle, { color: theme.textPrimary }]}>Power Tools</Text>
                <Text style={[styles.subTitle, { color: theme.textSecondary }]}>Everything to run your school.</Text>
            </View>

            <View style={styles.bentoGrid}>
                <View style={styles.row}>
                    <BentoCard icon={Users} title="Student Info" desc="Centralized records." delay={100} style={{ flex: 1 }} accentColor="#3b82f6" />
                    <BentoCard icon={CreditCard} title="Fee Mgmt" desc="Auto-collections." delay={200} style={{ flex: 1 }} accentColor="#10b981" />
                </View>
                <View style={styles.row}>
                    <BentoCard icon={FileText} title="Report Cards" desc="Custom grading." delay={300} style={{ flex: 1 }} accentColor="#f59e0b" />
                    <BentoCard icon={Bus} title="Transport" desc="Live tracking." delay={400} style={{ flex: 1 }} accentColor="#ef4444" />
                </View>
                <View style={styles.row}>
                    <BentoCard icon={BookOpen} title="LMS" desc="Digital learning." delay={500} style={{ flex: 1 }} accentColor="#8b5cf6" />
                    <BentoCard icon={BarChart3} title="Analytics" desc="Live KPI dashboard." delay={600} style={{ flex: 1 }} accentColor="#06b6d4" />
                </View>
            </View>
        </View>
    );
};

export const AboutView = () => {
    const { theme, isDarkMode } = useTheme();
    const [subTab, setSubTab] = useState('mission'); // 'mission', 'partners', 'faq'

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {['Mission', 'Partners', 'FAQ'].map((tab) => {
                const key = tab.toLowerCase();
                const isActive = subTab === key;
                return (
                    <TouchableOpacity
                        key={key}
                        onPress={() => setSubTab(key)}
                        style={[styles.tabButton, isActive && { backgroundColor: theme.primary + '20' }]}
                    >
                        <Text style={[styles.tabText, { color: isActive ? theme.primary : theme.textSecondary }]}>{tab}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderMission = () => (
        <View style={styles.centerContent}>
            <Text style={[styles.heroText, { color: theme.textPrimary }]}>
                Bridging the gap between <Text style={{ color: theme.primary }}>Education</Text> and <Text style={{ color: theme.primary }}>Technology</Text>.
            </Text>

            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                    <Text style={[styles.statValue, { color: theme.primary }]}>500+</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Schools</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                    <Text style={[styles.statValue, { color: theme.primary }]}>1M+</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Students</Text>
                </View>
            </View>

            <LinearGradient
                colors={isDarkMode ? ['#1e293b', '#0f172a'] : ['#ffffff', '#f1f5f9']}
                style={[styles.testimonialBox, { borderColor: theme.primary + '30' }]}
            >
                <View style={styles.quoteIcon}><Text style={{ fontSize: 40, color: theme.primary + '40' }}>"</Text></View>
                <Text style={[styles.testimonialText, { color: theme.textSecondary }]}>
                    Digital Vidya Saarthi has completely transformed how we manage our school.
                </Text>
                <Text style={[styles.testimonialAuthor, { color: theme.textPrimary }]}>
                    — Dr. Rajesh Kumar<Text style={{ color: theme.textSecondary, fontSize: 12 }}> Principal</Text>
                </Text>
            </LinearGradient>
        </View>
    );

    const renderPartners = () => {
        const partners = [
            "Tagore Convent School", "S.P.L High School", "B.K International",
            "S.S Vidya Mandir", "Digital Brand School", "Murari Lal Public",
            "Om Shri Saraswati", "Pine Hills Play School", "S.B.C Public School"
        ];
        return (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.partnersList}>
                {partners.map((p, i) => (
                    <View key={i} style={[styles.partnerCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                        <GraduationCap size={20} color={theme.textMuted} />
                        <Text style={[styles.partnerName, { color: theme.textPrimary }]}>{p}</Text>
                    </View>
                ))}
            </ScrollView>
        );
    };

    const renderFAQ = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.faqList}>
            <FAQItem
                question="What is Digital Vidya Saarthi?"
                answer="It is a comprehensive ERP software designed to streamline school management, from fees to attendance."
            />
            <FAQItem
                question="Is my data secure?"
                answer="Absolutely. We use industry-standard encryption and secure cloud servers to protect all institutional data."
            />
            <FAQItem
                question="Can parents access it?"
                answer="Yes! We provide a dedicated Parent Portal and Mobile App for real-time updates on their child's progress."
            />
            <FAQItem
                question="Do you offer support?"
                answer="We offer 24/7 dedicated support to ensure your school operations never stop."
            />
        </ScrollView>
    );

    return (
        <View style={styles.fullScreenContainer}>
            <View style={styles.header}>
                <Text style={[styles.bigTitle, { color: theme.textPrimary }]}>About Us</Text>
                {renderTabs()}
            </View>
            <View style={{ flex: 1, width: '100%' }}>
                {subTab === 'mission' && renderMission()}
                {subTab === 'partners' && renderPartners()}
                {subTab === 'faq' && renderFAQ()}
            </View>
        </View>
    );
};

export const ContactView = () => {
    const { theme } = useTheme();

    const ContactTile = ({ icon: Icon, label, value, onPress, delay, color }) => {
        const fadeAnim = useRef(new Animated.Value(0)).current;
        useEffect(() => {
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay, useNativeDriver: true }).start();
        }, []);

        return (
            <Animated.View style={{ opacity: fadeAnim, width: '100%', marginBottom: 12 }}>
                <TouchableOpacity onPress={onPress}>
                    <LinearGradient
                        colors={[theme.surface, theme.backgroundSecondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.contactTile, { borderColor: theme.surfaceBorder }]}
                    >
                        <View style={[styles.tileIcon, { backgroundColor: color + '15' }]}>
                            <Icon size={24} color={color} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.tileLabel, { color: theme.textSecondary }]}>{label}</Text>
                            <Text style={[styles.tileValue, { color: theme.textPrimary }]}>{value}</Text>
                        </View>
                        {onPress && <Text style={{ color: theme.textMuted }}>→</Text>}
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.fullScreenContainer}>
            <View style={styles.header}>
                <Text style={[styles.bigTitle, { color: theme.textPrimary }]}>Get in Touch</Text>
                <Text style={[styles.subTitle, { color: theme.textSecondary }]}>We're here to help.</Text>
            </View>

            <View style={styles.contactContainer}>
                <ContactTile icon={Phone} label="Call Us" value="+91 98765 43210" color="#3b82f6" delay={100} onPress={() => Linking.openURL('tel:+919876543210')} />
                <ContactTile icon={Mail} label="Email Support" value="info@digitalvidyasaarthi.in" color="#ec4899" delay={200} onPress={() => Linking.openURL('mailto:info@digitalvidyasaarthi.in')} />
                <ContactTile icon={Globe} label="Visit Website" value="www.digitalvidyasaarthi.in" color="#10b981" delay={300} onPress={() => Linking.openURL('https://www.digitalvidyasaarthi.in')} />
                <ContactTile icon={MapPin} label="Head Office" value="New Delhi, India" color="#8b5cf6" delay={400} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        padding: 24,
        paddingTop: 10,
    },
    header: {
        marginBottom: 16,
        alignItems: 'center',
    },
    bigTitle: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 15,
        marginTop: 4,
        opacity: 0.8,
        textAlign: 'center',
    },
    // Tabs
    tabContainer: {
        flexDirection: 'row',
        marginTop: 15,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
        padding: 4,
        gap: 4,
    },
    tabButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    // Bento Grid Styles
    bentoGrid: {
        flex: 1,
        gap: 12,
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        height: 110,
    },
    bentoCardWrapper: {
        height: '100%',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 6,
    },
    bentoCard: {
        flex: 1,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    cardGlow: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
    },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    textContainer: {
        alignItems: 'center',
    },
    bentoTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 3,
        textAlign: 'center',
    },
    bentoDesc: {
        fontSize: 11,
        lineHeight: 14,
        textAlign: 'center',
        opacity: 0.7,
    },
    // About Styles
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    heroText: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 20,
        marginTop: 10,
        paddingHorizontal: 10,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    testimonialBox: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        width: '100%',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    quoteIcon: {
        position: 'absolute',
        top: 10,
        left: 20,
    },
    testimonialText: {
        fontSize: 15,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 24,
        marginTop: 10,
    },
    testimonialAuthor: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    // Partners & FAQ
    partnersList: {
        paddingTop: 10,
        gap: 10,
        paddingBottom: 20,
    },
    partnerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    partnerName: {
        fontSize: 14,
        fontWeight: '600',
    },
    faqList: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    faqItem: {
        borderBottomWidth: 1,
        marginBottom: 10,
        paddingBottom: 10,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    faqAnswer: {
        marginTop: 10,
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.8,
    },
    // Contact Styles
    contactContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    contactTile: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 20,
        gap: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    tileIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tileLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
        opacity: 0.8,
    },
    tileValue: {
        fontSize: 16,
        fontWeight: '700',
    },
});
