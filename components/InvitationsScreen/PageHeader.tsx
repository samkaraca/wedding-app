import { InvitationsScreenFilterType } from '@/components/InvitationsScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const PageHeader = ({
    totalPeople,
    totalInvited,
    filter,
    setFilter,
}: {
    totalPeople: number,
    totalInvited: number,
    filter: InvitationsScreenFilterType,
    setFilter: Dispatch<SetStateAction<InvitationsScreenFilterType>>,
}) => {
    const filterScrollViewRef = useRef<ScrollView>(null);
    const filterScrollX = useRef(0);

    useEffect(() => {
        // Restore filter bar scroll position when filter state changes (which causes rerender)
        filterScrollViewRef.current?.scrollTo({ x: filterScrollX.current, animated: false });
    }, []);

    // Also run when filter changes to ensure position retained
    useEffect(() => {
        filterScrollViewRef.current?.scrollTo({ x: filterScrollX.current, animated: false });
    }, [filter]);

    return (
        <>
            <View style={styles.header}>
                <Image
                    source={require('../../assets/images/letter.png')}
                    style={styles.headerBackgroundImage}
                    resizeMode="contain"
                />
                <View style={styles.headerTop}>
                    <Text style={styles.title}>Davetliler</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <View style={[styles.statIconWrapper, { backgroundColor: '#E0E7FF' }]}>
                        <Ionicons name="people" size={18} color="#4338CA" />
                    </View>
                    <Text style={styles.statLabel}>Toplam</Text>
                    <Text style={styles.statNumber}>{totalPeople}</Text>
                </View>
                <View style={styles.statItem}>
                    <View style={[styles.statIconWrapper, { backgroundColor: '#D1FAE5' }]}>
                        <Ionicons name="send" size={18} color="#047857" />
                    </View>
                    <Text style={styles.statLabel}>Davet Edildi</Text>
                    <Text style={styles.statNumber}>{totalInvited}</Text>
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
                {(['all', 'not_invited', 'invited', 'gelin', 'damat', 'ortak'] as InvitationsScreenFilterType[]).map((filterType) => (
                    <TouchableOpacity
                        key={filterType}
                        style={[
                            styles.filterButton,
                            filter === filterType && styles.filterButtonActive
                        ]}
                        onPress={() => setFilter(filterType as typeof filter)}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            filter === filterType && styles.filterButtonTextActive
                        ]}>
                            {(() => {
                                switch (filterType) {
                                    case 'all':
                                        return 'Tümü';
                                    case 'invited':
                                        return 'Davet Edilenler';
                                    case 'not_invited':
                                        return 'Davet Edilmeyenler';
                                    case 'gelin':
                                        return 'Gelin Tarafı';
                                    case 'damat':
                                        return 'Damat Tarafı';
                                    case 'ortak':
                                        return 'Ortak Davetli';
                                    default:
                                        return '';
                                }
                            })()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
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
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 4,
        lineHeight: 30,
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        overflow: 'visible',
    },
    headerBackgroundImage: {
        position: 'absolute',
        top: -20,
        left: -60,
        width: 300,
        height: 300,
        opacity: 0.15,
        transform: [{ rotate: '-10deg' }],
        zIndex: 0,
    },
    headerTop: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
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
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: 'transparent',
        marginTop: 8,
        gap: 8,
    },
});