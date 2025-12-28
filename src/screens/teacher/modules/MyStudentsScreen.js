import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useTheme } from '../../../theme'; // Correct import
import { useAuth } from '../../../context/AuthContext';
import { teacherApi } from '../../../api/teacherApi';
import { Search, Phone, User, Filter, ChevronRight, GraduationCap } from 'lucide-react-native';

const MyStudentsScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { userInfo } = useAuth();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGender, setFilterGender] = useState('All'); // All, Male, Female

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            console.log("MyStudents - Full UserInfo:", JSON.stringify(userInfo));
            // Default to Class IV/A if missing, since web screenshot shows IV
            const assignedClass = userInfo?.classTeacher || "IV";
            const assignedSection = userInfo?.section || "A";

            console.log(`MyStudents - Fetching for Class: ${assignedClass}, Section: ${assignedSection}`);

            const data = await teacherApi.getAllStudents(assignedClass, assignedSection);

            console.log(`MyStudents - API Response Length: ${data?.length}`);

            if (data && Array.isArray(data)) {
                console.log("Unique Genders Found:", [...new Set(data.map(s => s.gender))]);
                setStudents(data);
            }
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchStudents();
    };

    // Derived Data
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            // Search Text
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                (student.studentName?.toLowerCase() || '').includes(query) ||
                (student.admissionNumber?.toString() || '').includes(query);

            // Gender Filter
            let matchesGender = true;
            if (filterGender !== 'All') {
                const g = (student.gender || '').toLowerCase();
                if (filterGender === 'Male') {
                    matchesGender = g === 'male' || g === 'm' || g === 'boy';
                } else if (filterGender === 'Female') {
                    matchesGender = g === 'female' || g === 'f' || g === 'girl';
                }
            }

            return matchesSearch && matchesGender;
        });
    }, [students, searchQuery, filterGender]);

    const renderStudentCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface }]}
            onPress={() => {
                navigation.navigate('StudentDetails', { student: item });
            }}
        >
            <View style={styles.cardInner}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    {item.studentImage?.url ? (
                        <Image source={{ uri: item.studentImage.url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + '15' }]}>
                            <Text style={[styles.avatarInitials, { color: theme.primary }]}>
                                {item.studentName ? item.studentName.substring(0, 2).toUpperCase() : "??"}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.cardContent}>
                    <Text style={[styles.studentName, { color: theme.textPrimary }]} numberOfLines={1}>
                        {item.studentName}
                    </Text>
                    <Text style={[styles.admNo, { color: theme.textSecondary }]}>
                        Adm: {item.admissionNumber || "N/A"} • Roll: {item.rollNo || "-"}
                    </Text>
                    <View style={styles.parentRow}>
                        <User size={12} color={theme.textSecondary} />
                        <Text style={[styles.parentName, { color: theme.textSecondary }]} numberOfLines={1}>
                            {item.fatherName || "Parent Info N/A"}
                        </Text>
                    </View>
                </View>

                {/* Action Icon */}
                <View style={styles.actionIcon}>
                    <ChevronRight size={20} color={theme.textSecondary} style={{ opacity: 0.5 }} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const FilterChip = ({ label }) => (
        <TouchableOpacity
            style={[
                styles.chip,
                {
                    backgroundColor: filterGender === label ? theme.primary : theme.surface,
                    borderWidth: 1,
                    borderColor: filterGender === label ? theme.primary : theme.border
                }
            ]}
            onPress={() => setFilterGender(label)}
        >
            <Text style={[
                styles.chipText,
                { color: filterGender === label ? '#FFF' : theme.textSecondary }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            {/* Search & Filter Header */}
            <View style={[styles.headerContainer, { backgroundColor: theme.surface }]}>
                {/* Search Bar */}
                <View style={[styles.searchBar, { backgroundColor: theme.backgroundSecondary }]}>
                    <Search size={20} color={theme.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.textPrimary }]}
                        placeholder="Search by Name or Admission No..."
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={{ color: theme.textSecondary }}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Chips */}
                <View style={styles.chipScroll}>
                    <FilterChip label="All" />
                    <FilterChip label="Male" />
                    <FilterChip label="Female" />
                </View>

                {/* Count Badge */}
                <View style={[styles.countBadge, { borderTopColor: theme.border }]}>
                    <Text style={[styles.countText, { color: theme.textSecondary }]}>
                        Showing {filteredStudents.length} Students
                    </Text>
                </View>
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredStudents}
                    renderItem={renderStudentCard}
                    keyExtractor={item => item._id || Math.random().toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <GraduationCap size={48} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No students found.</Text>
                        </View>
                    }
                    initialNumToRender={10}
                    windowSize={5}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        paddingTop: 16,
        paddingBottom: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
    },
    chipScroll: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    countBadge: {
        paddingTop: 8,
        borderTopWidth: 1,
    },
    countText: {
        fontSize: 12,
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
    },
    card: {
        borderRadius: 16,
        marginBottom: 12,
        elevation: 1,
    },
    cardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    studentName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    admNo: {
        fontSize: 12,
        marginBottom: 4,
        opacity: 0.8,
    },
    parentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    parentName: {
        fontSize: 12,
        opacity: 0.8,
    },
    actionIcon: {
        paddingLeft: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 14,
    }
});

export default MyStudentsScreen;
