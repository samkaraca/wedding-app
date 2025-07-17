import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    SafeAreaView,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

import { AddOrEditPersonModal } from '@/components/InvitationsScreen/AddOrEditPersonModal';
import ContactsImportModal from '@/components/InvitationsScreen/ContactsImportModal';
import { MessageModal } from '@/components/InvitationsScreen/MessageModal';
import { PageHeader } from '@/components/InvitationsScreen/PageHeader';
import { SectionListHeader } from '@/components/InvitationsScreen/SectionListHeader';
import { PersonCard } from '@/components/PersonCard';
import { Person } from '@/types';

// Add a colors constant to replace removed Colors usage
export const INVITATION_SCREEN_COLORS = {
    text: '#1A1A1A',
    background: '#FFFFFF',
    border: '#E5E7EB',
    tint: '#2196F3',
};

export type InvitationsScreenFilterType = 'all' | 'not_invited' | 'invited' | 'gelin' | 'damat' | 'ortak';

export function InvitationScreen() {
    const [addOrEditPersonModalVisible, setAddOrEditPersonModalVisible] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [people, setPeople] = useState<Person[]>([]);
    const [contactsModalVisible, setContactsModalVisible] = useState(false);
    const [filter, setFilter] = useState<InvitationsScreenFilterType>('all');
    const [bulkSelectMode, setBulkSelectMode] = useState(false);
    const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
    const [messageModalVisible, setMessageModalVisible] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [messageBackdropAnimation] = useState(new Animated.Value(0));
    const [peopleSearchQuery, setPeopleSearchQuery] = useState('');

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = async () => {
        try {
            const savedPeople = await AsyncStorage.getItem('wedding_people');
            if (savedPeople) {
                setPeople(JSON.parse(savedPeople));
            }
        } catch (error) {
            console.error('Error loading people:', error);
        }
    };

    const savePeople = async (updatedPeople: Person[]) => {
        try {
            await AsyncStorage.setItem('wedding_people', JSON.stringify(updatedPeople));
            setPeople(updatedPeople);
        } catch (error) {
            console.error('Error saving people:', error);
        }
    };

    const toggleInvited = (id: string) => {
        const updatedPeople = people.map(person =>
            person.id === id ? { ...person, invited: !person.invited } : person
        );
        savePeople(updatedPeople);
    };

    const getFilteredPeople = () => {
        let list = people;
        switch (filter) {
            case 'not_invited':
                list = list.filter(person => !person.invited);
                break;
            case 'invited':
                list = list.filter(person => person.invited);
                break;
            case 'gelin':
                list = list.filter(person => person.side === 'gelin');
                break;
            case 'damat':
                list = list.filter(person => person.side === 'damat');
                break;
            case 'ortak':
                list = list.filter(person => person.side === 'ortak');
                break;
            default:
                break; // 'all' does not filter
        }
        if (peopleSearchQuery.trim()) {
            const q = peopleSearchQuery.toLowerCase();
            list = list.filter(person => person.name.toLowerCase().includes(q) || (person.phone || '').includes(q));
        }
        return list;
    };

    const togglePersonSelection = (personId: string) => {
        const newSelected = new Set(selectedPeople);
        if (newSelected.has(personId)) {
            newSelected.delete(personId);
        } else {
            newSelected.add(personId);
        }
        setSelectedPeople(newSelected);
    };

    const startBulkSelect = () => {
        setBulkSelectMode(true);
        setSelectedPeople(new Set());
    };

    const renderPerson = ({ item }: { item: Person; index: number; section: any }) => {
        const isSelected = selectedPeople.has(item.id);

        const handlePress = () => {
            // Single tap behavior only
            if (bulkSelectMode) {
                togglePersonSelection(item.id);
            } else {
                // Toggle invited status on single tap
                toggleInvited(item.id);
            }
        };

        return (
            <PersonCard
                person={item}
                isSelected={isSelected}
                bulkSelectMode={bulkSelectMode}
                onPress={handlePress}
                onLongPress={() => {
                    if (!bulkSelectMode) {
                        startBulkSelect();
                        togglePersonSelection(item.id);
                    }
                }}
            />
        );
    };

    const openMessageModal = () => {
        setMessageModalVisible(true);
        Animated.timing(messageBackdropAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeMessageModal = () => {
        Animated.timing(messageBackdropAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setMessageModalVisible(false);
            setMessageText('');
        });
    };

    const cancelBulkSelect = () => {
        setBulkSelectMode(false);
        setSelectedPeople(new Set());
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Floating Action Button */}
            {!bulkSelectMode && (
                <View style={styles.fabContainer}>
                    <TouchableOpacity
                        style={[styles.fabButton, styles.fabPrimary]}
                        onPress={() => setAddOrEditPersonModalVisible(true)}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            <MessageModal
                people={people}
                selectedPeople={selectedPeople}
                closeMessageModal={closeMessageModal}
                messageText={messageText}
                setMessageText={setMessageText}
                messageModalVisible={messageModalVisible}
                messageBackdropAnimation={messageBackdropAnimation}
                cancelBulkSelect={cancelBulkSelect}
            />

            {/* Using SectionList for proper sticky header behavior */}
            <SectionList
                sections={[{ title: 'People', data: getFilteredPeople() }]}
                renderItem={renderPerson}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={<PageHeader
                    totalPeople={people.length}
                    totalInvited={people.filter(p => p.invited).length}
                    filter={filter}
                    setFilter={setFilter}
                />}
                renderSectionHeader={() => <SectionListHeader
                    openMessageModal={openMessageModal}
                    cancelBulkSelect={cancelBulkSelect}
                    setPeople={setPeople}
                    savePeople={savePeople}
                    people={people}
                    selectedPeople={selectedPeople}
                    setEditingPerson={setEditingPerson}
                    setAddOrEditPersonModalVisible={setAddOrEditPersonModalVisible}
                    peopleSearchQuery={peopleSearchQuery}
                    setPeopleSearchQuery={setPeopleSearchQuery}
                    bulkSelectMode={bulkSelectMode}
                />}
                contentContainerStyle={{ paddingBottom: 120 }}
                style={styles.list}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={true}
            />
            <AddOrEditPersonModal
                addOrEditPersonModalVisible={addOrEditPersonModalVisible}
                setAddOrEditPersonModalVisible={setAddOrEditPersonModalVisible}
                savePeople={savePeople}
                people={people}
                setContactsModalVisible={setContactsModalVisible}
                editingPerson={editingPerson}
                setEditingPerson={setEditingPerson}
            />
            <ContactsImportModal
                contactsModalVisible={contactsModalVisible}
                setContactsModalVisible={setContactsModalVisible}
                savePeople={savePeople}
                people={people}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        alignItems: 'center',
        zIndex: 2,
    },
    fabButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    fabPrimary: {
        backgroundColor: '#2196F3',
    },
    list: {
        flex: 1,
    },
});
