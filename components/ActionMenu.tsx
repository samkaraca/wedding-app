import { Person } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionMenuProps {
    visible: boolean;
    person: Person | null;
    onClose: () => void;
    onWhatsApp: (phone: string) => void;
    onEdit: (person: Person) => void;
    onDelete: (personId: string) => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
    visible,
    person,
    onClose,
    onWhatsApp,
    onEdit,
    onDelete,
}) => {
    if (!visible || !person) return null;

    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            animationType="slide"
        >
            <View style={styles.actionMenuOverlay}>
                <TouchableOpacity
                    style={styles.actionMenuBackdrop}
                    onPress={onClose}
                />
                <View style={styles.actionMenuBottomSheet}>
                    <View style={styles.actionMenuHandle} />
                    <View style={styles.actionMenuContent}>
                        <TouchableOpacity
                            style={styles.actionMenuItem}
                            onPress={() => {
                                if (person.phone) {
                                    onWhatsApp(person.phone);
                                }
                                onClose();
                            }}
                        >
                            <Ionicons name="logo-whatsapp" size={24} color="#6B7280" />
                            <Text style={styles.actionMenuText}>WhatsApp Gönder</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionMenuItem}
                            onPress={() => {
                                onEdit(person);
                                onClose();
                            }}
                        >
                            <Ionicons name="create" size={24} color="#2196F3" />
                            <Text style={styles.actionMenuText}>Düzenle</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionMenuItem}
                            onPress={() => {
                                onDelete(person.id);
                                onClose();
                            }}
                        >
                            <Ionicons name="trash" size={24} color="#9CA3AF" />
                            <Text style={styles.actionMenuText}>Sil</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    actionMenuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    actionMenuBackdrop: {
        flex: 1,
    },
    actionMenuBottomSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 34,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    actionMenuHandle: {
        width: 36,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    actionMenuContent: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    actionMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        marginVertical: 4,
    },
    actionMenuText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1A1A1A',
        marginLeft: 12,
    },
}); 