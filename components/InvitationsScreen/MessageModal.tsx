import { INVITATION_SCREEN_COLORS } from "@/components/InvitationsScreen";
import { Person } from "@/types";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, Animated, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export const MessageModal = ({
    people,
    selectedPeople,
    closeMessageModal,
    messageText,
    setMessageText,
    messageModalVisible,
    messageBackdropAnimation,
    cancelBulkSelect,
}: {
    people: Person[],
    selectedPeople: Set<string>,
    closeMessageModal: () => void,
    messageText: string,
    setMessageText: (text: string) => void,
    messageModalVisible: boolean,
    messageBackdropAnimation: any,
    cancelBulkSelect: () => void,
}) => {
    const processBulkSMS = () => {
        if (!messageText.trim()) {
            Alert.alert('Uyarı', 'Lütfen bir mesaj yazın.');
            return;
        }

        const selectedPersons = people.filter(person => selectedPeople.has(person.id));
        const personsWithPhone = selectedPersons.filter(person => person.phone);

        if (personsWithPhone.length === 0) {
            Alert.alert('Uyarı', 'Seçilen kişilerin hiçbirinin telefon numarası yok.');
            return;
        }

        if (personsWithPhone.length < selectedPersons.length) {
            Alert.alert(
                'Uyarı',
                `${selectedPersons.length - personsWithPhone.length} kişinin telefon numarası yok. Sadece ${personsWithPhone.length} kişiye SMS gönderilecek.`,
                [
                    { text: 'İptal', style: 'cancel' },
                    { text: 'Devam Et', onPress: () => sendSMSToAll(personsWithPhone) }
                ]
            );
        } else {
            sendSMSToAll(personsWithPhone);
        }
    };

    const sendSMSToAll = (personsWithPhone: Person[]) => {
        const { Linking } = require('react-native');

        // Get all phone numbers
        const phoneNumbers = personsWithPhone.map(person => person.phone!.replace(/[^\d+]/g, ''));

        // Create SMS URL with multiple recipients
        const smsUrl = `sms:${phoneNumbers.join(';')}?body=${encodeURIComponent(messageText)}`;

        Linking.canOpenURL(smsUrl).then((supported: boolean) => {
            if (supported) {
                Linking.openURL(smsUrl);
                closeMessageModal();
                cancelBulkSelect();
                setMessageText('');
                Alert.alert('SMS Gönderildi', `${personsWithPhone.length} kişiye SMS gönderildi.`);
            } else {
                Alert.alert('Hata', 'SMS gönderimi desteklenmiyor.');
            }
        }).catch((err: any) => {
            console.error('SMS gönderirken hata:', err);
            Alert.alert('Hata', 'SMS gönderirken bir hata oluştu.');
        });
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={messageModalVisible}
            onRequestClose={closeMessageModal}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
            >
                <Animated.View
                    style={[
                        styles.messageBackdrop,
                        {
                            opacity: messageBackdropAnimation,
                        },
                    ]}
                />
                <View style={[styles.modalContent, { backgroundColor: INVITATION_SCREEN_COLORS.background }]}>
                    <View style={styles.messageModalHeader}>
                        <Ionicons name="chatbubble" size={24} color="#007AFF" />
                        <Text style={[styles.messageModalTitle, { color: INVITATION_SCREEN_COLORS.text }]}>
                            Toplu SMS Mesajı
                        </Text>
                    </View>

                    <Text style={[styles.messageModalSubtitle, { color: INVITATION_SCREEN_COLORS.text }]}>
                        {selectedPeople.size} kişiye SMS gönderilecek
                    </Text>

                    <TextInput
                        style={[styles.messageInput, { borderColor: INVITATION_SCREEN_COLORS.border, color: INVITATION_SCREEN_COLORS.text }]}
                        placeholder="Mesajınızı buraya yazın..."
                        placeholderTextColor={INVITATION_SCREEN_COLORS.text + '80'}
                        value={messageText}
                        onChangeText={setMessageText}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={closeMessageModal}
                        >
                            <Text style={styles.cancelButtonText}>İptal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: '#007AFF' }]}
                            onPress={processBulkSMS}
                        >
                            <Text style={styles.saveButtonText}>Gönder</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    messageModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    messageModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    messageModalSubtitle: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center',
    },
    messageInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 20,
        fontSize: 16,
        height: 120,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    cancelButtonText: {
        color: '#333',
        textAlign: 'center',
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        padding: 20,
        borderRadius: 20,
        maxHeight: '80%',
    },
    saveButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
    },
    messageBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});