
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  paid: boolean;
}

const CATEGORIES = [
  { id: 'venue', name: 'Mekan', icon: 'business' },
  { id: 'food', name: 'Yemek', icon: 'restaurant' },
  { id: 'dress', name: 'Kıyafet', icon: 'shirt' },
  { id: 'photo', name: 'Fotoğraf', icon: 'camera' },
  { id: 'music', name: 'Müzik', icon: 'musical-notes' },
  { id: 'flowers', name: 'Çiçek', icon: 'flower' },
  { id: 'invitation', name: 'Davetiye', icon: 'mail' },
  { id: 'transport', name: 'Ulaşım', icon: 'car' },
  { id: 'other', name: 'Diğer', icon: 'ellipsis-horizontal' }
];

export default function ExpenseScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'other',
    notes: ''
  });
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [backdropAnimation] = useState(new Animated.Value(0));
  const [sheetAnimation] = useState(new Animated.Value(0));
  const [sheetHeight, setSheetHeight] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk selection states
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());

  // Ref to preserve scroll position of filter bar
  const filterScrollViewRef = React.useRef<ScrollView>(null);
  const filterScrollX = React.useRef(0);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    // Restore filter bar scroll position when filter state changes (which causes rerender)
    filterScrollViewRef.current?.scrollTo({ x: filterScrollX.current, animated: false });
  }, []);

  // Also run when filter changes to ensure position retained
  useEffect(() => {
    filterScrollViewRef.current?.scrollTo({ x: filterScrollX.current, animated: false });
  }, [filter]);

  const loadExpenses = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem('wedding_expenses');
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const saveExpenses = async (updatedExpenses: Expense[]) => {
    try {
      await AsyncStorage.setItem('wedding_expenses', JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const addExpense = () => {
    if (!newExpense.title.trim() || !newExpense.amount.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve tutar giriniz');
      return;
    }

    const amount = parseFloat(newExpense.amount.replace(',', '.'));
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
      notes: newExpense.notes.trim(),
      paid: false
    };

    const updatedExpenses = [...expenses, expense];
    saveExpenses(updatedExpenses);
    resetForm();
    setModalVisible(false);
  };

  const updateExpense = () => {
    if (!editingExpense || !newExpense.title.trim() || !newExpense.amount.trim()) return;

    const amount = parseFloat(newExpense.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar giriniz');
      return;
    }

    const updatedExpenses = expenses.map(expense =>
      expense.id === editingExpense.id
        ? {
          ...expense,
          title: newExpense.title.trim(),
          amount: amount,
          category: newExpense.category,
          notes: newExpense.notes.trim()
        }
        : expense
    );

    saveExpenses(updatedExpenses);
    resetForm();
    setEditingExpense(null);
    setModalVisible(false);
  };

  const deleteExpense = (id: string) => {
    Alert.alert(
      'Sil',
      'Bu gideri silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const updatedExpenses = expenses.filter(expense => expense.id !== id);
            saveExpenses(updatedExpenses);
          }
        }
      ]
    );
  };

  const togglePaid = (id: string) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === id ? { ...expense, paid: !expense.paid } : expense
    );
    saveExpenses(updatedExpenses);
  };

  const resetForm = () => {
    setNewExpense({
      title: '',
      amount: '',
      category: 'other',
      notes: ''
    });
  };

  const openModal = () => {
    setModalVisible(true);
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
  };
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
      setEditingExpense(null);
      resetForm();
    });
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      notes: expense.notes || ''
    });
    openModal();
  };

  const getFilteredExpenses = () => {
    let filtered = expenses;

    // Filter by payment status
    switch (filter) {
      case 'paid':
        filtered = filtered.filter(expense => expense.paid);
        break;
      case 'unpaid':
        filtered = filtered.filter(expense => !expense.paid);
        break;
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(q) ||
        expense.notes?.toLowerCase().includes(q) ||
        getCategoryInfo(expense.category).name.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('tr-TR')} ₺`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  // Bulk selection functions
  const toggleExpenseSelection = (expenseId: string) => {
    const newSelected = new Set(selectedExpenses);
    if (newSelected.has(expenseId)) {
      newSelected.delete(expenseId);
    } else {
      newSelected.add(expenseId);
    }
    setSelectedExpenses(newSelected);
  };

  const startBulkSelect = () => {
    setBulkSelectMode(true);
    setSelectedExpenses(new Set());
  };

  const cancelBulkSelect = () => {
    setBulkSelectMode(false);
    setSelectedExpenses(new Set());
  };

  const deleteBulkExpenses = () => {
    if (selectedExpenses.size === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir gider seçin.');
      return;
    }

    const updatedExpenses = expenses.filter(expense => !selectedExpenses.has(expense.id));
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    cancelBulkSelect();
  };

  const renderExpense = ({ item }: { item: Expense; index: number; section: any }) => {
    const category = getCategoryInfo(item.category);
    const isPaid = item.paid;
    const isSelected = selectedExpenses.has(item.id);
    let tapCount = 0;

    const handlePress = () => {
      tapCount++;
      if (tapCount === 1) {
        setTimeout(() => {
          if (tapCount === 1) {
            // Single tap
            if (bulkSelectMode) {
              toggleExpenseSelection(item.id);
            } else {
              // Toggle paid status on single tap
              togglePaid(item.id);
            }
          } else if (tapCount === 2) {
            // Double tap - open edit modal
            if (!bulkSelectMode) {
              openEditModal(item);
            }
          }
          tapCount = 0;
        }, 300);
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.expenseCard,
          isSelected && styles.expenseCardSelected
        ]}
        activeOpacity={0.8}
        onPress={handlePress}
        onLongPress={() => {
          if (!bulkSelectMode) {
            startBulkSelect();
            toggleExpenseSelection(item.id);
          }
        }}
        delayLongPress={500}
      >
        <View style={styles.expenseCardContent}>
          {/* Selection indicator */}
          {bulkSelectMode && (
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.expenseCheckbox,
                isSelected && styles.expenseCheckboxSelected
              ]}>
                {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
            </View>
          )}

          <View style={styles.expenseInfo}>
            {/* Title & amount */}
            <View style={styles.expenseHeader}>
              <Text style={styles.expenseName}>{item.title}</Text>
              <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
            </View>

            {/* Category and Status Badge */}
            <View style={styles.expenseDetails}>
              <Text style={styles.expenseCategory}>{category.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  isPaid ? styles.statusPaid : styles.statusUnpaid,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isPaid ? styles.statusTextPaid : styles.statusTextUnpaid,
                  ]}
                >
                  {isPaid ? 'Ödendi' : 'Ödenmedi'}
                </Text>
              </View>
            </View>

            {/* Notes (optional) */}
            {item.notes ? (
              <Text style={styles.expenseNotes}>{item.notes}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const stats = {
    total: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    paid: expenses.filter(e => e.paid).reduce((sum, expense) => sum + expense.amount, 0),
    unpaid: expenses.filter(e => !e.paid).reduce((sum, expense) => sum + expense.amount, 0),
    count: expenses.length
  };

  const renderPageHeader = () => (
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
            onPress={() => setFilter(filterType as typeof filter)}
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
        {[{ id: 'all', name: 'Tümü', icon: 'grid' }, ...CATEGORIES].map((category) => (
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Simple Floating Action Button */}
      {!bulkSelectMode && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={openModal}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Using SectionList for proper sticky header behavior */}
      <SectionList
        sections={[{ title: 'Expenses', data: getFilteredExpenses() }]}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderPageHeader}
        renderSectionHeader={() => (
          <View style={styles.stickySearchSection}>
            <View style={styles.expenseSearchContainer}>
              <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.expenseSearchInput}
                placeholder="Gider ara..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Bulk Actions in Sticky Header */}
            {bulkSelectMode && (
              <View style={styles.stickyBulkActions}>
                <Text style={styles.stickyBulkActionText}>
                  {selectedExpenses.size} gider seçildi
                </Text>
                <View style={styles.stickyBulkActionButtons}>
                  <TouchableOpacity
                    style={[styles.stickyBulkActionButton, { backgroundColor: '#f44336' }]}
                    onPress={deleteBulkExpenses}
                    disabled={selectedExpenses.size === 0}
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
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
      />

      {/* Bottom Sheet Modal for Add/Edit Expense */}
      <Modal
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
                    {editingExpense ? 'Gideri Düzenle' : 'Yeni Gider Ekle'}
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
                    value={newExpense.amount}
                    onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                    keyboardType="numeric"
                  />

                  <View style={styles.bottomSheetCategoryContainer}>
                    <Text style={styles.bottomSheetCategoryLabel}>Kategori:</Text>
                    <FlatList
                      data={CATEGORIES}
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
                    onPress={editingExpense ? updateExpense : addExpense}
                  >
                    <Text style={styles.bottomSheetActionButtonText}>
                      {editingExpense ? 'Güncelle' : 'Ekle'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  },

  list: {
    flex: 1,
  },
  expenseCard: {
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
    position: 'relative', // allow absolute badge positioning
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6, // tighter spacing
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flexShrink: 1,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4, // tighter spacing
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  expenseNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 10,
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1A1A1A',
  },
  categoryGrid: {
    maxHeight: 150,
  },
  categorySelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    margin: 3,
    flex: 1,
  },
  categorySelectButtonText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '600',
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
    backgroundColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    zIndex: 2,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
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

  // Action Menu Styles - Bottom Sheet
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

  // Badge Styles (similar to PersonCard)
  expenseTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusPaid: {
    backgroundColor: '#E8F5E8',
  },
  statusUnpaid: {
    backgroundColor: '#FEF3C7',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextPaid: {
    color: '#4CAF50',
  },
  statusTextUnpaid: {
    color: '#F59E0B',
  },
  // Sticky search section
  stickySearchSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  expenseSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 10,
  },
  expenseSearchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
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

  // Bulk selection styles
  expenseCardSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  expenseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  expenseCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  expenseCheckboxSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },

  // Sticky bulk actions styles
  stickyBulkActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
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
});