import { EXPENSE_CATEGORIES } from ".";
import { Expense } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Alert, Animated, Dimensions, Easing, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export const NewExpenseModal = ({
    modalVisible,
    setModalVisible,
    expenses,
    saveExpenses,
}: {
    modalVisible: boolean;
    setModalVisible: Dispatch<SetStateAction<boolean>>;
    expenses: Expense[];
    saveExpenses: (expenses: Expense[]) => void;
}) => {
    const [newExpense, setNewExpense] = useState<Expense>({
        id: '',
        title: '',
        amount: 0,
        category: 'other',
        date: '',
        notes: '',
        paid: false
    });
    const [backdropAnimation] = useState(new Animated.Value(0));
    const [sheetAnimation] = useState(new Animated.Value(0));
    const [sheetHeight, setSheetHeight] = useState(0);

    const resetForm = () => {
        setNewExpense({
            id: '',
            title: '',
            amount: 0,
            category: 'other',
            date: '',
            notes: '',
            paid: false
        });
    };

    useEffect(() => {
        if (modalVisible) {
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
        } else {
            closeModal();
        }
    }, [modalVisible]);

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
            setModalVisible(false);
            resetForm();
        });
    };

    const addExpense = () => {
        if (!newExpense.title.trim() || !newExpense.amount.toString().trim()) {
            Alert.alert('Hata', 'Lütfen başlık ve tutar giriniz');
            return;
        }

        const amount = parseFloat(newExpense.amount.toString().replace(',', '.'));
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Hata', 'Lütfen geçerli bir tutar giriniz');
            return;
        }

        const expense: Expense = {
            id: Date.now().toString(),
            title: newExpense.title.trim(),
            amount: amount,
            category: newExpense.category,
            date: new Date().toISOString(),
            notes: newExpense.notes?.trim() || '',
            paid: false
        };

        const updatedExpenses = [...expenses, expense];
        saveExpenses(updatedExpenses);
        resetForm();
        closeModal();
    };

    return <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
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
                                {'Yeni Gider Ekle'}
                            </Text>
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
                                placeholder="Gider Başlığı"
                                placeholderTextColor="#9CA3AF"
                                value={newExpense.title}
                                onChangeText={(text) => setNewExpense({ ...newExpense, title: text })}
                            />

                            <TextInput
                                style={styles.bottomSheetInput}
                                placeholder="Tutar (₺)"
                                placeholderTextColor="#9CA3AF"
                                value={newExpense.amount.toString()}
                                onChangeText={(text) => setNewExpense({ ...newExpense, amount: parseFloat(text) })}
                                keyboardType="numeric"
                            />

                            <View style={styles.bottomSheetCategoryContainer}>
                                <Text style={styles.bottomSheetCategoryLabel}>Kategori:</Text>
                                <FlatList
                                    data={EXPENSE_CATEGORIES}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.bottomSheetCategoryButton,
                                                { backgroundColor: newExpense.category === item.id ? '#2196F3' : '#F3F4F6' }
                                            ]}
                                            onPress={() => setNewExpense({ ...newExpense, category: item.id })}
                                        >
                                            <Ionicons name={item.icon as any} size={16} color={newExpense.category === item.id ? 'white' : '#6B7280'} />
                                            <Text style={[
                                                styles.bottomSheetCategoryButtonText,
                                                { color: newExpense.category === item.id ? 'white' : '#374151' }
                                            ]}>
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item) => item.id}
                                    numColumns={3}
                                    style={styles.bottomSheetCategoryGrid}
                                />
                            </View>

                            <TextInput
                                style={[styles.bottomSheetInput, styles.bottomSheetNotesInput]}
                                placeholder="Notlar (opsiyonel)"
                                placeholderTextColor="#9CA3AF"
                                value={newExpense.notes}
                                onChangeText={(text) => setNewExpense({ ...newExpense, notes: text })}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />

                            {/* Action Button */}
                            <TouchableOpacity
                                style={styles.bottomSheetActionButton}
                                onPress={addExpense}
                            >
                                <Text style={styles.bottomSheetActionButtonText}>
                                    {'Ekle'}
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
        paddingBottom: 20,
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
    bottomSheetCategoryContainer: {
        marginBottom: 15,
    },
    bottomSheetCategoryLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    bottomSheetCategoryGrid: {
        maxHeight: 120,
    },
    bottomSheetCategoryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 10,
        borderRadius: 10,
        margin: 4,
        minHeight: 40,
    },
    bottomSheetCategoryButtonText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
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
})