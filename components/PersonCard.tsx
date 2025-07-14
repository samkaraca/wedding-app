import { Person } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PersonCardProps {
    person: Person;
    isSelected: boolean;
    bulkSelectMode: boolean;
    onPress: () => void;
    onLongPress: () => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
    person,
    isSelected,
    bulkSelectMode,
    onPress,
    onLongPress,
}) => {
    // Get background image based on person side
    const getBackgroundImage = () => {
        if (person.side === 'gelin') {
            return require('../assets/images/bride.png');
        } else if (person.side === 'damat') {
            return require('../assets/images/groom.png');
        }
        return null;
    };

    const backgroundImage = getBackgroundImage();

    return (
        <TouchableOpacity
            style={[
                styles.personCard,
                bulkSelectMode && isSelected && styles.personCardSelected
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={500}
        >
            {/* Background Image */}
            {backgroundImage && (
                <Image
                    source={backgroundImage}
                    style={styles.backgroundImage}
                    resizeMode="contain"
                />
            )}

            <View style={styles.personCardContent}>
                {bulkSelectMode && (
                    <View style={styles.checkboxContainer}>
                        <View style={[
                            styles.personCheckbox,
                            isSelected && styles.personCheckboxSelected
                        ]}>
                            {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                    </View>
                )}

                <View style={styles.personInfo}>
                    <View style={styles.personHeader}>
                        <Text style={styles.personName}>{person.name}</Text>
                        {/* Status Badge - inline positioning */}
                        <View style={[
                            styles.statusBadge,
                            person.invited ? styles.statusInvited : styles.statusNotInvited
                        ]}>
                            <Text style={[
                                styles.statusText,
                                person.invited ? styles.statusTextInvited : styles.statusTextNotInvited
                            ]}>
                                {person.invited ? 'Davet Edildi' : 'Davet Edilmedi'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.personDetails}>
                        {person.phone && <Text style={styles.personPhone}>{person.phone}</Text>}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    personCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        overflow: 'hidden', // ensure background image doesn't overflow
    },
    personCardSelected: {
        borderColor: '#2196F3',
        backgroundColor: '#F0F8FF',
    },
    backgroundImage: {
        position: 'absolute',
        top: -10,
        right: -20,
        width: 120,
        height: 120,
        opacity: 0.08,
        zIndex: 0,
    },
    personCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1, // ensure content is above background image
    },
    checkboxContainer: {
        marginRight: 12,
    },
    personCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    personCheckboxSelected: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    personInfo: {
        flex: 1,
    },
    personHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6, // match expense card spacing
    },
    personName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A', // black text like expense card
        flex: 1,
        paddingRight: 8, // small gap from badge
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusInvited: {
        backgroundColor: '#E3F2FD',
    },
    statusNotInvited: {
        backgroundColor: '#FEF3C7',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    statusTextInvited: {
        color: '#2196F3',
    },
    statusTextNotInvited: {
        color: '#F59E0B',
    },
    personDetails: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 4, // match expense card spacing
    },
    personPhone: {
        fontSize: 14,
        color: '#1A1A1A', // changed from grey to black like expense card
        flex: 1,
    },
}); 