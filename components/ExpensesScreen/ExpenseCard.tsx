import { getCategoryInfo } from "@/components/ExpensesScreen";
import { formatCurrency } from "@/lib/format";
import { Expense } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const ExpenseCard = ({ item, isSelected, isPaid, bulkSelectMode, toggleExpenseSelection, togglePaid, startBulkSelect }: { item: Expense; isSelected: boolean; isPaid: boolean, bulkSelectMode: boolean, toggleExpenseSelection: (id: string) => void, togglePaid: (id: string) => void, startBulkSelect: () => void }) => {
    const category = getCategoryInfo(item.category);

    const handlePress = () => {
        if (bulkSelectMode) {
            toggleExpenseSelection(item.id);
        } else {
            togglePaid(item.id);
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

const styles = StyleSheet.create({
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
    expenseCardSelected: {
        backgroundColor: '#E3F2FD',
        borderWidth: 2,
        borderColor: '#2196F3',
    },
    expenseNotes: {
        fontSize: 12,
        fontStyle: 'italic',
        marginBottom: 10,
        color: '#6B7280',
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
    }, statusBadge: {
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
})