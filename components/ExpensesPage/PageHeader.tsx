import { EXPENSE_CATEGORIES } from "@/app/(tabs)/explore";
import { formatCurrency } from "@/lib/format";
import { Ionicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const PageHeader = ({
    stats,
    filter,
    setFilter,
    selectedCategory,
    setSelectedCategory,
    filterScrollViewRef,
    filterScrollX,
}: {
    stats: {
        total: number;
        paid: number;
        unpaid: number;
        count: number;
    }
    filter: string;
    setFilter: Dispatch<SetStateAction<'all' | 'paid' | 'unpaid'>>;
    selectedCategory: string;
    setSelectedCategory: Dispatch<SetStateAction<string>>;
    filterScrollViewRef: React.RefObject<ScrollView | null>;
    filterScrollX: React.RefObject<number>;
}) => (
    <>
        <View style={styles.header}>
            {/* Decorative money image as background */}
            <Image
                source={require('../../assets/images/money.png')}
                style={styles.headerBackgroundImage}
                resizeMode="contain"
            />
            <View style={styles.headerTop}>
                <Text style={styles.title}>Giderler</Text>
            </View>
        </View>

        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <View style={[styles.statIconWrapper, { backgroundColor: '#E0E7FF' }]}>
                    <Ionicons name="wallet" size={18} color="#4338CA" />
                </View>
                <Text style={styles.statLabel}>Toplam</Text>
                <Text style={styles.statNumber}>{formatCurrency(stats.total)}</Text>
            </View>
            <View style={styles.statItem}>
                <View style={[styles.statIconWrapper, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="checkmark-done-outline" size={18} color="#047857" />
                </View>
                <Text style={styles.statLabel}>Ödendi</Text>
                <Text style={styles.statNumber}>{formatCurrency(stats.paid)}</Text>
            </View>
        </View>

        <ScrollView
            ref={filterScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
            onScroll={(e) => {
                filterScrollX.current = e.nativeEvent.contentOffset.x;
            }}
            scrollEventThrottle={16}
        >
            {['all', 'paid', 'unpaid'].map((filterType) => (
                <TouchableOpacity
                    key={filterType}
                    style={[
                        styles.filterButton,
                        filter === filterType && styles.filterButtonActive
                    ]}
                    onPress={() => setFilter(filterType as 'all' | 'paid' | 'unpaid')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        filter === filterType && styles.filterButtonTextActive
                    ]}>
                        {filterType === 'all' ? 'Tümü' : filterType === 'paid' ? 'Ödenenler' : 'Ödenmeyenler'}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>

        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFilterContainer}
        >
            {[{ id: 'all', name: 'Tümü', icon: 'grid' }, ...EXPENSE_CATEGORIES].map((category) => (
                <TouchableOpacity
                    key={category.id}
                    style={[
                        styles.categoryFilterButton,
                        selectedCategory === category.id && styles.categoryFilterButtonActive
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                >
                    <Ionicons
                        name={category.icon as any}
                        size={16}
                        color={selectedCategory === category.id ? 'white' : '#6B7280'}
                    />
                    <Text style={[
                        styles.categoryFilterButtonText,
                        selectedCategory === category.id && styles.categoryFilterButtonTextActive
                    ]}>
                        {category.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </>
);

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        overflow: 'visible',
    },
    headerBackgroundImage: {
        position: 'absolute',
        top: -10,
        right: -40,
        width: 260,
        height: 260,
        opacity: 0.08,
        transform: [{ rotate: '15deg' }],
    },
    headerTop: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        marginTop: 8,
        gap: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 0.5,
        borderColor: '#E0E0E0',
        minHeight: 100,
    },
    statIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 4,
        lineHeight: 30,
    }, filterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: 'transparent',
        marginTop: 8,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    filterButtonText: {
        color: '#666666',
        fontSize: 14,
        fontWeight: '600',
    },
    filterButtonActive: {
        backgroundColor: '#2196F3',
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
    },
    categoryFilterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'transparent',
        gap: 8,
    },
    categoryFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: '#E5E7EB',
    },
    categoryFilterButtonActive: {
        backgroundColor: '#2196F3',
    },
    categoryFilterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
        color: '#6B7280',
    },
    categoryFilterButtonTextActive: {
        color: 'white',
    },
});