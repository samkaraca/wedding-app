import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

export const SectionListHeader = ({
    searchQuery,
    setSearchQuery,
    bulkSelectMode,
    selectedExpenses,
    deleteBulkExpenses,
    cancelBulkSelect,
}: {
    searchQuery: string;
    setSearchQuery: (text: string) => void;
    bulkSelectMode: boolean;
    selectedExpenses: Set<string>;
    deleteBulkExpenses: () => void;
    cancelBulkSelect: () => void;
}) => {
    return (
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
    )
}

const styles = StyleSheet.create({
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
})