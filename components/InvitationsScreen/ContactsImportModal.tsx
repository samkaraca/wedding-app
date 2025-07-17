import { INVITATION_SCREEN_COLORS } from "@/components/InvitationsScreen";
import { Contact, Person } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from 'expo-contacts';
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ContactsImportModal({
    contactsModalVisible,
    setContactsModalVisible,
    savePeople,
    people
}: {
    contactsModalVisible: boolean,
    setContactsModalVisible: Dispatch<SetStateAction<boolean>>,
    savePeople: (people: Person[]) => void,
    people: Person[],
}) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [contactsLoading, setContactsLoading] = useState(false);

    const renderContact = ({ item }: { item: Contact }) => {
        const isSelected = selectedContacts.has(item.id);
        const phoneNumber = item.phoneNumbers?.[0]?.number || '';

        return (
            <TouchableOpacity
                style={[
                    styles.contactItem,
                    {
                        backgroundColor: isSelected ? '#F0F8FF' : '#FFFFFF',
                        borderColor: isSelected ? '#2196F3' : '#E5E7EB'
                    }
                ]}
                onPress={() => toggleContactSelection(item.id)}
            >
                <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    {phoneNumber && (
                        <Text style={styles.contactPhone}>{phoneNumber}</Text>
                    )}
                </View>
                <View style={[
                    styles.contactCheckbox,
                    {
                        backgroundColor: isSelected ? '#2196F3' : 'transparent',
                        borderColor: '#2196F3'
                    }
                ]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
            </TouchableOpacity>
        );
    };

    const closeContactsModal = () => {
        // Close modal without backdrop animation
        setContactsModalVisible(false);
        setSelectedContacts(new Set());
        setSearchQuery('');
    };

    useEffect(() => {
        loadContacts();
    }, []);

    const getFilteredContacts = () => {
        if (!searchQuery.trim()) return contacts;
        return contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const requestContactsPermission = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        return status === 'granted';
    };



    const toggleContactSelection = (contactId: string) => {
        const newSelection = new Set(selectedContacts);
        if (newSelection.has(contactId)) {
            newSelection.delete(contactId);
        } else {
            newSelection.add(contactId);
        }
        setSelectedContacts(newSelection);
    };

    const loadContacts = async () => {
        setContactsLoading(true);
        try {
            const hasPermission = await requestContactsPermission();
            if (!hasPermission) {
                Alert.alert('İzin Gerekli', 'Kişileri içe aktarmak için rehber erişim izni gereklidir.');
                setContactsLoading(false);
                return;
            }

            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
                sort: Contacts.SortTypes.LastName,
            });

            const formattedContacts: Contact[] = data
                .filter(contact => contact.name && contact.name.trim() !== '')
                .map(contact => ({
                    id: contact.id || Math.random().toString(),
                    name: contact.name || '',
                    phoneNumbers: contact.phoneNumbers || []
                }));

            setContacts(formattedContacts);
            setContactsModalVisible(true);
        } catch (error) {
            console.error('Error loading contacts:', error);
            Alert.alert('Hata', 'Kişiler yüklenirken bir hata oluştu.');
        } finally {
            setContactsLoading(false);
        }
    };

    const importSelectedContacts = () => {
        const contactsToImport = contacts.filter(contact => selectedContacts.has(contact.id));

        if (contactsToImport.length === 0) {
            Alert.alert('Uyarı', 'Lütfen içe aktarmak için en az bir kişi seçin.');
            return;
        }

        const newPeople: Person[] = contactsToImport.map(contact => ({
            id: Date.now().toString() + Math.random().toString(),
            name: contact.name,
            phone: contact.phoneNumbers?.[0]?.number || '',
            invited: false,
            side: 'ortak',
            notes: ''
        }));

        const updatedPeople = [...people, ...newPeople];
        savePeople(updatedPeople);

        setSelectedContacts(new Set());
        closeContactsModal();
        setSearchQuery('');

        Alert.alert('Başarılı', `${newPeople.length} kişi başarıyla eklendi.`);
    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={contactsModalVisible}
            onRequestClose={closeContactsModal}
        >
            <SafeAreaView style={[styles.contactsModal, { backgroundColor: INVITATION_SCREEN_COLORS.background }]}>
                <View style={styles.contactsHeader}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeContactsModal}
                    >
                        <Ionicons name="close" size={24} color={INVITATION_SCREEN_COLORS.text} />
                    </TouchableOpacity>

                    <Text style={[styles.contactsTitle, { color: INVITATION_SCREEN_COLORS.text }]}>Kişileri Seç</Text>

                    <TouchableOpacity
                        style={[
                            styles.importSelectedButton,
                            {
                                backgroundColor: selectedContacts.size > 0 ? INVITATION_SCREEN_COLORS.tint : '#ccc',
                                opacity: selectedContacts.size > 0 ? 1 : 0.6
                            }
                        ]}
                        onPress={importSelectedContacts}
                        disabled={selectedContacts.size === 0}
                    >
                        <Text style={styles.importSelectedText}>
                            Rehberden Ekle ({selectedContacts.size})
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={INVITATION_SCREEN_COLORS.text} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: INVITATION_SCREEN_COLORS.text, borderColor: INVITATION_SCREEN_COLORS.border }]}
                        placeholder="Kişi ara..."
                        placeholderTextColor={INVITATION_SCREEN_COLORS.text + '80'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <FlatList
                    data={getFilteredContacts()}
                    renderItem={renderContact}
                    keyExtractor={(item) => item.id}
                    style={styles.contactsList}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.contactSeparator} />}
                />
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    contactsModal: {
        flex: 1,
    },
    contactsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    closeButton: {
        padding: 5,
    },
    contactsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    importSelectedButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    importSelectedText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 15,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: '#FFFFFF',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    contactsList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    contactSeparator: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 15,
    }, contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    contactPhone: {
        fontSize: 14,
        opacity: 0.7,
    },
    contactCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        borderWidth: 1,
        marginVertical: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
});