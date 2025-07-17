import { Person } from "@/types";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Alert, Animated, Dimensions, Easing, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export const AddOrEditPersonModal = ({
    addOrEditPersonModalVisible,
    setAddOrEditPersonModalVisible,
    savePeople,
    people,
    setContactsModalVisible,
    editingPerson,
    setEditingPerson
}: {
    addOrEditPersonModalVisible: boolean,
    setAddOrEditPersonModalVisible: Dispatch<SetStateAction<boolean>>,
    savePeople: (people: Person[]) => void,
    people: Person[],
    setContactsModalVisible: Dispatch<SetStateAction<boolean>>,
    editingPerson: Person | null,
    setEditingPerson: Dispatch<SetStateAction<Person | null>>
}) => {
    const [newPerson, setNewPerson] = useState<Person>({
        id: '',
        name: '',
        phone: '',
        side: 'ortak',
        notes: '',
        invited: false
    });
    const [backdropAnimation] = useState(new Animated.Value(0));
    const [sheetAnimation] = useState(new Animated.Value(0)); // 0 closed, 1 open
    const [sheetHeight, setSheetHeight] = useState(0);

    useEffect(() => {
        if (addOrEditPersonModalVisible) {
            if (editingPerson) {
                setNewPerson({
                    name: editingPerson.name,
                    phone: editingPerson.phone,
                    side: editingPerson.side,
                    notes: editingPerson.notes,
                    invited: editingPerson.invited,
                    id: editingPerson.id
                });
            }
            // Reset animation values
            sheetAnimation.setValue(0);
            Animated.parallel([
                Animated.timing(backdropAnimation, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(sheetAnimation, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [addOrEditPersonModalVisible]);

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(backdropAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(sheetAnimation, {
                toValue: 0,
                duration: 300,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setAddOrEditPersonModalVisible(false);
            setEditingPerson(null);
            resetForm();
        });
    };

    const resetForm = () => {
        setNewPerson({
            id: '',
            name: '',
            phone: '',
            side: 'ortak',
            notes: '',
            invited: false
        });
    };

    const addPerson = () => {
        if (!newPerson.name.trim()) {
            Alert.alert('Hata', 'Lütfen isim giriniz');
            return;
        }

        const person: Person = {
            id: Date.now().toString(),
            name: newPerson.name.trim(),
            phone: newPerson.phone?.trim() || '',
            invited: false,
            side: newPerson.side,
            notes: newPerson.notes?.trim() || ''
        };

        const updatedPeople = [...people, person] as Person[];
        savePeople(updatedPeople);
        resetForm();
        setAddOrEditPersonModalVisible(false);
    };

    const updatePerson = () => {
        if (!editingPerson || !newPerson.name.trim()) return;

        const updatedPeople = people.map(person =>
            person.id === editingPerson.id
                ? {
                    ...person,
                    name: newPerson.name.trim(),
                    phone: newPerson.phone?.trim() || '',
                    side: newPerson.side,
                    notes: newPerson.notes?.trim() || ''
                }
                : person
        );

        savePeople(updatedPeople);
        resetForm();
        setEditingPerson(null);
        setAddOrEditPersonModalVisible(false);
    };

    return <Modal
        animationType="fade"
        transparent={true}
        visible={addOrEditPersonModalVisible}
        onRequestClose={closeModal}
    >
        <View style={styles.bottomSheetOverlay}>
            <Animated.View
                style={[
                    styles.bottomSheetBackdrop,
                    {
                        opacity: backdropAnimation,
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.bottomSheetBackdropTouchable}
                    onPress={closeModal}
                    activeOpacity={1}
                />
            </Animated.View>

            <Animated.View
                style={{
                    transform: [{
                        translateY: sheetAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [sheetHeight || Dimensions.get('window').height, 0],
                        }),
                    }],
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.bottomSheetContainer}
                    onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
                >
                    <View style={styles.bottomSheetContent}>
                        {/* Handle bar */}
                        <View style={styles.bottomSheetHandle} />

                        {/* Header */}
                        <View style={styles.bottomSheetHeader}>
                            <Text style={styles.bottomSheetTitle}>
                                {editingPerson ? 'Kişiyi Düzenle' : 'Yeni Kişi Ekle'}
                            </Text>
                            {/* Import contacts button */}
                            {!editingPerson && (
                                <TouchableOpacity
                                    style={styles.importInSheetButton}
                                    onPress={() => setContactsModalVisible(true)}
                                >
                                    <Ionicons name="people" size={20} color="#2196F3" />
                                    <Text style={styles.importInSheetButtonText}>Rehberden Ekle</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.bottomSheetCloseButton}
                                onPress={closeModal}
                            >
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Form Content */}
                        <View style={styles.bottomSheetForm}>
                            <TextInput
                                style={styles.bottomSheetInput}
                                placeholder="İsim Soyisim"
                                placeholderTextColor="#9CA3AF"
                                value={newPerson.name}
                                onChangeText={(text) => setNewPerson({ ...newPerson, name: text })}
                            />

                            <TextInput
                                style={styles.bottomSheetInput}
                                placeholder="Telefon (opsiyonel)"
                                placeholderTextColor="#9CA3AF"
                                value={newPerson.phone}
                                onChangeText={(text) => setNewPerson({ ...newPerson, phone: text })}
                                keyboardType="phone-pad"
                            />

                            <View style={styles.bottomSheetSideContainer}>
                                <Text style={styles.bottomSheetSideLabel}>Hangi Taraf:</Text>
                                <View style={styles.bottomSheetSideButtons}>
                                    {['gelin', 'damat', 'ortak'].map((side) => (
                                        <TouchableOpacity
                                            key={side}
                                            style={[
                                                styles.bottomSheetSideButton,
                                                { backgroundColor: newPerson.side === side ? '#2196F3' : '#F3F4F6' }
                                            ]}
                                            onPress={() => setNewPerson({ ...newPerson, side: side as any })}
                                        >
                                            <Text style={[
                                                styles.bottomSheetSideButtonText,
                                                { color: newPerson.side === side ? 'white' : '#374151' }
                                            ]}>
                                                {side === 'gelin' ? 'Gelin Tarafı' : side === 'damat' ? 'Damat Tarafı' : 'Ortak'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TextInput
                                style={[styles.bottomSheetInput, styles.bottomSheetNotesInput]}
                                placeholder="Notlar (opsiyonel)"
                                placeholderTextColor="#9CA3AF"
                                value={newPerson.notes}
                                onChangeText={(text) => setNewPerson({ ...newPerson, notes: text })}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />

                            {/* Action Button */}
                            <TouchableOpacity
                                style={styles.bottomSheetActionButton}
                                onPress={editingPerson ? updatePerson : addPerson}
                            >
                                <Text style={styles.bottomSheetActionButtonText}>
                                    {editingPerson ? 'Güncelle' : 'Ekle'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Animated.View>
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    // Bottom Sheet Modal Styles
    bottomSheetOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
    },
    bottomSheetBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    bottomSheetBackdropTouchable: {
        flex: 1,
    },
    bottomSheetContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    bottomSheetContent: {
        paddingBottom: 20, // Add some padding at the bottom for the handle
    },
    bottomSheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 10,
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    bottomSheetCloseButton: {
        padding: 5,
    },
    bottomSheetForm: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    bottomSheetInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 15,
        fontSize: 16,
        borderColor: '#E5E7EB',
    },
    bottomSheetSideContainer: {
        marginBottom: 15,
    },
    bottomSheetSideLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    bottomSheetSideButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
    },
    bottomSheetSideButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
    },
    bottomSheetSideButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    bottomSheetNotesInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    bottomSheetActionButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSheetActionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    importInSheetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        marginRight: 8,
    },
    importInSheetButtonText: {
        marginLeft: 4,
        color: '#2196F3',
        fontWeight: '600',
    },
});