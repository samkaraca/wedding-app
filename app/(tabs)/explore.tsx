
import { ExpenseCard } from '@/components/ExpensesPage/ExpenseCard';
import { NewExpenseModal } from '@/components/ExpensesPage/NewExpenseModal';
import { PageHeader } from '@/components/ExpensesPage/PageHeader';
import { SectionListHeader } from '@/components/ExpensesPage/SectionListHeader';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View
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

export const getCategoryInfo = (categoryId: string) => {
  return EXPENSE_CATEGORIES.find(cat => cat.id === categoryId) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
};

export const EXPENSE_CATEGORIES = [
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
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);

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

  const togglePaid = (id: string) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === id ? { ...expense, paid: !expense.paid } : expense
    );
    saveExpenses(updatedExpenses);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setModalVisible(true);
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

  const stats = {
    total: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    paid: expenses.filter(e => e.paid).reduce((sum, expense) => sum + expense.amount, 0),
    unpaid: expenses.filter(e => !e.paid).reduce((sum, expense) => sum + expense.amount, 0),
    count: expenses.length
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Simple Floating Action Button */}
      {!bulkSelectMode && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Using SectionList for proper sticky header behavior */}
      <SectionList
        sections={[{ title: 'Expenses', data: getFilteredExpenses() }]}
        renderItem={({ item }) => <ExpenseCard
          item={item}
          isSelected={selectedExpenses.has(item.id)}
          isPaid={item.paid}
          bulkSelectMode={bulkSelectMode}
          toggleExpenseSelection={toggleExpenseSelection}
          togglePaid={togglePaid}
          openEditModal={openEditModal}
          startBulkSelect={startBulkSelect}
        />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<PageHeader
          stats={stats}
          filter={filter}
          setFilter={setFilter}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          filterScrollViewRef={filterScrollViewRef}
          filterScrollX={filterScrollX}
        />}
        renderSectionHeader={() => <SectionListHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          bulkSelectMode={bulkSelectMode}
          selectedExpenses={selectedExpenses}
          deleteBulkExpenses={deleteBulkExpenses}
          cancelBulkSelect={cancelBulkSelect}
        />}
        contentContainerStyle={{ paddingBottom: 120 }}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
      />

      {/* Bottom Sheet Modal for Add/Edit Expense */}
      <NewExpenseModal
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        expenses={expenses}
        saveExpenses={saveExpenses}
      />

    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  list: {
    flex: 1,
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
});