import { Person } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export const SectionListHeader = ({
    openMessageModal,
    cancelBulkSelect,
    setPeople,
    savePeople,
    people,
    selectedPeople,
    setEditingPerson,
    setAddOrEditPersonModalVisible,
    peopleSearchQuery,
    setPeopleSearchQuery,
    bulkSelectMode,
}: {
    openMessageModal: () => void,
    cancelBulkSelect: () => void,
    setPeople: (people: Person[]) => void,
    savePeople: (people: Person[]) => void,
    people: Person[],
    selectedPeople: Set<string>,
    setEditingPerson: (person: Person) => void,
    setAddOrEditPersonModalVisible: (visible: boolean) => void,
    peopleSearchQuery: string,
    setPeopleSearchQuery: (query: string) => void,
    bulkSelectMode: boolean,
}) => {
    // WhatsApp messaging functions
    const openWhatsApp = (phoneNumber: string, message: string = '') => {
        const { Linking } = require('react-native');

        // Clean phone number (remove spaces, dashes, etc.)
        const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');

        // Create WhatsApp URL
        const whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

        Linking.canOpenURL(whatsappUrl).then((supported: boolean) => {
            if (supported) {
                return Linking.openURL(whatsappUrl);
            } else {
                Alert.alert('WhatsApp bulunamadı', 'WhatsApp uygulaması yüklü değil.');
            }
        }).catch((err: any) => {
            console.error('WhatsApp açılırken hata:', err);
            Alert.alert('Hata', 'WhatsApp açılırken bir hata oluştu.');
        });
    };

    const sendBulkSMS = () => {
        if (selectedPeople.size === 0) {
            Alert.alert('Uyarı', 'Lütfen en az bir kişi seçin.');
            return;
        }
        openMessageModal();
    };

    const deleteBulkPeople = () => {
        if (selectedPeople.size === 0) {
            Alert.alert('Uyarı', 'Lütfen en az bir kişi seçin.');
            return;
        }

        const updatedPeople = people.filter(person => !selectedPeople.has(person.id));
        setPeople(updatedPeople);
        savePeople(updatedPeople);
        cancelBulkSelect();
    };

    return (
        <View style={styles.stickySearchSection}>
            <View style={styles.peopleSearchContainer}>
                <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
                <TextInput
                    style={styles.peopleSearchInput}
                    placeholder="İsim veya telefon ara..."
                    placeholderTextColor="#9CA3AF"
                    value={peopleSearchQuery}
                    onChangeText={setPeopleSearchQuery}
                />
            </View>

            {/* Bulk Actions in Sticky Header */}
            {bulkSelectMode && (
                <View style={styles.stickyBulkActions}>
                    <Text style={styles.stickyBulkActionText}>
                        {selectedPeople.size} kişi seçildi
                    </Text>
                    <View style={styles.stickyBulkActionButtons}>
                        {/* Single person actions - only show when exactly one person is selected */}
                        {selectedPeople.size === 1 && (
                            <>
                                <TouchableOpacity
                                    style={[styles.stickyBulkActionButton, { backgroundColor: '#25D366' }]}
                                    onPress={() => {
                                        const selectedPersonId = Array.from(selectedPeople)[0];
                                        const person = people.find(p => p.id === selectedPersonId);
                                        if (person?.phone) {
                                            openWhatsApp(person.phone);
                                        }
                                    }}
                                >
                                    <Ionicons name="logo-whatsapp" size={18} color="white" />
                                    <Text style={styles.stickyBulkActionButtonText}>WhatsApp</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.stickyBulkActionButton, { backgroundColor: '#2196F3' }]}
                                    onPress={() => {
                                        const selectedPersonId = Array.from(selectedPeople)[0];
                                        const person = people.find(p => p.id === selectedPersonId);
                                        if (person) {
                                            setEditingPerson(person);
                                            setAddOrEditPersonModalVisible(true);
                                            cancelBulkSelect();
                                        }
                                    }}
                                >
                                    <Ionicons name="create" size={18} color="white" />
                                    <Text style={styles.stickyBulkActionButtonText}>Düzenle</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Bulk actions - show when one or more people are selected */}
                        <TouchableOpacity
                            style={[styles.stickyBulkActionButton, { backgroundColor: '#007AFF' }]}
                            onPress={sendBulkSMS}
                            disabled={selectedPeople.size === 0}
                        >
                            <Ionicons name="chatbubble" size={18} color="white" />
                            <Text style={styles.stickyBulkActionButtonText}>SMS Gönder</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.stickyBulkActionButton, { backgroundColor: '#f44336' }]}
                            onPress={deleteBulkPeople}
                            disabled={selectedPeople.size === 0}
                        >
                            <Ionicons name="trash" size={18} color="white" />
                            <Text style={styles.stickyBulkActionButtonText}>Sil</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.stickyBulkActionButton, { backgroundColor: '#666' }]}
                            onPress={cancelBulkSelect}
                        >
                            <Ionicons name="close" size={18} color="white" />
                            <Text style={styles.stickyBulkActionButtonText}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    stickySearchSection: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        zIndex: 10, // Ensure the sticky header is rendered above list items
    },
    stickyBulkActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    stickyBulkActionText: {
        color: '#1A1A1A',
        fontSize: 15,
        fontWeight: '600',
        marginRight: 8,
    },
    stickyBulkActionButtons: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        flexShrink: 1,
    },
    stickyBulkActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 10,
        minWidth: 60,
    },
    stickyBulkActionButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    peopleSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
    },
    peopleSearchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1A1A1A',
    },
    searchIcon: {
        marginRight: 10,
    },
});