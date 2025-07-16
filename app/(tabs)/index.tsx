import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';
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
  View
} from 'react-native';

import { PersonCard } from '@/components/PersonCard';
import { Contact, Person } from '@/types';

// Add a colors constant to replace removed Colors usage
const colors = {
  text: '#1A1A1A',
  background: '#FFFFFF',
  border: '#E5E7EB',
  tint: '#2196F3',
};

export default function InvitationScreen() {
  const [people, setPeople] = useState<Person[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [newPerson, setNewPerson] = useState({
    name: '',
    phone: '',
    side: 'ortak' as 'gelin' | 'damat' | 'ortak',
    notes: ''
  });
  // Available filter types
  type FilterType = 'all' | 'not_invited' | 'invited' | 'gelin' | 'damat' | 'ortak';

  const [filter, setFilter] = useState<FilterType>('all');

  // Bulk messaging states
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageText, setMessageText] = useState('');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState(new Set<string>());
  const [contactsLoading, setContactsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const [fabAnimation] = useState(new Animated.Value(0));
  const [actionAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
  ]);
  const [backdropAnimation] = useState(new Animated.Value(0));
  const [contactsBackdropAnimation] = useState(new Animated.Value(0));
  const [messageBackdropAnimation] = useState(new Animated.Value(0));
  const [fabBackdropAnimation] = useState(new Animated.Value(0));
  const [sheetAnimation] = useState(new Animated.Value(0)); // 0 closed, 1 open
  const [sheetHeight, setSheetHeight] = useState(0);
  const [peopleSearchQuery, setPeopleSearchQuery] = useState('');
  // Ref to preserve scroll position of filter bar
  const filterScrollViewRef = React.useRef<ScrollView>(null);
  const filterScrollX = React.useRef(0);

  useEffect(() => {
    loadPeople();
  }, []);

  useEffect(() => {
    // Restore filter bar scroll position when filter state changes (which causes rerender)
    filterScrollViewRef.current?.scrollTo({ x: filterScrollX.current, animated: false });
  }, []);

  // Also run when filter changes to ensure position retained
  useEffect(() => {
    filterScrollViewRef.current?.scrollTo({ x: filterScrollX.current, animated: false });
  }, [filter]);

  const loadPeople = async () => {
    try {
      const savedPeople = await AsyncStorage.getItem('wedding_people');
      if (savedPeople) {
        setPeople(JSON.parse(savedPeople));
      }
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const savePeople = async (updatedPeople: Person[]) => {
    try {
      await AsyncStorage.setItem('wedding_people', JSON.stringify(updatedPeople));
      setPeople(updatedPeople);
    } catch (error) {
      console.error('Error saving people:', error);
    }
  };

  const requestContactsPermission = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
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

  const toggleContactSelection = (contactId: string) => {
    const newSelection = new Set(selectedContacts);
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      newSelection.add(contactId);
    }
    setSelectedContacts(newSelection);
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

  const addPerson = () => {
    if (!newPerson.name.trim()) {
      Alert.alert('Hata', 'Lütfen isim giriniz');
      return;
    }

    const person: Person = {
      id: Date.now().toString(),
      name: newPerson.name.trim(),
      phone: newPerson.phone.trim(),
      invited: false,
      side: newPerson.side,
      notes: newPerson.notes.trim()
    };

    const updatedPeople = [...people, person];
    savePeople(updatedPeople);
    resetForm();
    setModalVisible(false);
  };

  const updatePerson = () => {
    if (!editingPerson || !newPerson.name.trim()) return;

    const updatedPeople = people.map(person =>
      person.id === editingPerson.id
        ? {
          ...person,
          name: newPerson.name.trim(),
          phone: newPerson.phone.trim(),
          side: newPerson.side,
          notes: newPerson.notes.trim()
        }
        : person
    );

    savePeople(updatedPeople);
    resetForm();
    setEditingPerson(null);
    setModalVisible(false);
  };

  const deletePerson = (id: string) => {
    Alert.alert(
      'Sil',
      'Bu kişiyi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const updatedPeople = people.filter(person => person.id !== id);
            savePeople(updatedPeople);
          }
        }
      ]
    );
  };

  const toggleInvited = (id: string) => {
    const updatedPeople = people.map(person =>
      person.id === id ? { ...person, invited: !person.invited } : person
    );
    savePeople(updatedPeople);
  };

  const resetForm = () => {
    setNewPerson({
      name: '',
      phone: '',
      side: 'ortak',
      notes: ''
    });
  };

  const openEditModal = (person: Person) => {
    setEditingPerson(person);
    setNewPerson({
      name: person.name,
      phone: person.phone || '',
      side: person.side,
      notes: person.notes || ''
    });
    openModal();
  };

  const getFilteredPeople = () => {
    let list = people;
    switch (filter) {
      case 'not_invited':
        list = list.filter(person => !person.invited);
        break;
      case 'invited':
        list = list.filter(person => person.invited);
        break;
      case 'gelin':
        list = list.filter(person => person.side === 'gelin');
        break;
      case 'damat':
        list = list.filter(person => person.side === 'damat');
        break;
      case 'ortak':
        list = list.filter(person => person.side === 'ortak');
        break;
      default:
        break; // 'all' does not filter
    }
    if (peopleSearchQuery.trim()) {
      const q = peopleSearchQuery.toLowerCase();
      list = list.filter(person => person.name.toLowerCase().includes(q) || (person.phone || '').includes(q));
    }
    return list;
  };

  const getFilteredContacts = () => {
    if (!searchQuery.trim()) return contacts;
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

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

  const togglePersonSelection = (personId: string) => {
    const newSelected = new Set(selectedPeople);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedPeople(newSelected);
  };

  const startBulkSelect = () => {
    setBulkSelectMode(true);
    setSelectedPeople(new Set());
  };

  const cancelBulkSelect = () => {
    setBulkSelectMode(false);
    setSelectedPeople(new Set());
  };

  // SMS messaging functions
  const sendBulkSMS = () => {
    if (selectedPeople.size === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir kişi seçin.');
      return;
    }
    openMessageModal();
  };

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

  // Bulk delete functionality
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

  const renderPerson = ({ item }: { item: Person; index: number; section: any }) => {
    const isSelected = selectedPeople.has(item.id);

    const handlePress = () => {
      // Single tap behavior only
      if (bulkSelectMode) {
        togglePersonSelection(item.id);
      } else {
        // Toggle invited status on single tap
        toggleInvited(item.id);
      }
    };

    return (
      <PersonCard
        person={item}
        isSelected={isSelected}
        bulkSelectMode={bulkSelectMode}
        onPress={handlePress}
        onLongPress={() => {
          if (!bulkSelectMode) {
            startBulkSelect();
            togglePersonSelection(item.id);
          }
        }}
      />
    );
  };

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

  const stats = {
    total: people.length,
    invited: people.filter(p => p.invited).length
  };

  const openModal = () => {
    setModalVisible(true);
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
      setEditingPerson(null);
      resetForm();
    });
  };

  // Open contacts modal and ensure contacts are loaded
  const openContactsModal = async () => {
    // Show modal immediately for responsiveness
    setContactsModalVisible(true);

    // Load contacts – this will request permission if needed and populate state
    await loadContacts();

    // No backdrop animation needed
  };

  const closeContactsModal = () => {
    // Close modal without backdrop animation
    setContactsModalVisible(false);
    setSelectedContacts(new Set());
    setSearchQuery('');
  };

  const openMessageModal = () => {
    setMessageModalVisible(true);
    Animated.timing(messageBackdropAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMessageModal = () => {
    Animated.timing(messageBackdropAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setMessageModalVisible(false);
      setMessageText('');
    });
  };

  const renderPageHeader = () => (
    <>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/letter.png')}
          style={styles.headerBackgroundImage}
          resizeMode="contain"
        />
        <View style={styles.headerTop}>
          <Text style={styles.title}>Davetliler</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.statIconWrapper, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="people" size={18} color="#4338CA" />
          </View>
          <Text style={styles.statLabel}>Toplam</Text>
          <Text style={styles.statNumber}>{stats.total}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIconWrapper, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="send" size={18} color="#047857" />
          </View>
          <Text style={styles.statLabel}>Davet Edildi</Text>
          <Text style={styles.statNumber}>{stats.invited}</Text>
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
        {(['all', 'not_invited', 'invited', 'gelin', 'damat', 'ortak'] as FilterType[]).map((filterType) => (
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
              {(() => {
                switch (filterType) {
                  case 'all':
                    return 'Tümü';
                  case 'invited':
                    return 'Davet Edilenler';
                  case 'not_invited':
                    return 'Davet Edilmeyenler';
                  case 'gelin':
                    return 'Gelin Tarafı';
                  case 'damat':
                    return 'Damat Tarafı';
                  case 'ortak':
                    return 'Ortak Davetli';
                  default:
                    return '';
                }
              })()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>


    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Expandable Floating Action Button */}
      {!bulkSelectMode && (
        <>
          <View style={styles.fabContainer}>
            <TouchableOpacity
              style={[styles.fabButton, styles.fabPrimary]}
              onPress={openModal}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Using SectionList for proper sticky header behavior */}
      <SectionList
        sections={[{ title: 'People', data: getFilteredPeople() }]}
        renderItem={renderPerson}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderPageHeader}
        renderSectionHeader={() => (
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
                            openEditModal(person);
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
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
      />

      {/* Bottom Sheet Modal for Add Person */}
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
                    {editingPerson ? 'Kişiyi Düzenle' : 'Yeni Kişi Ekle'}
                  </Text>
                  {/* Import contacts button */}
                  {!editingPerson && (
                    <TouchableOpacity
                      style={styles.importInSheetButton}
                      onPress={openContactsModal}
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

      {/* Contacts Import Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={contactsModalVisible}
        onRequestClose={closeContactsModal}
      >
        <SafeAreaView style={[styles.contactsModal, { backgroundColor: colors.background }]}>
          {/* Removed the dark backdrop to prevent grey overlay */}
          <View style={styles.contactsHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeContactsModal}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={[styles.contactsTitle, { color: colors.text }]}>Kişileri Seç</Text>

            <TouchableOpacity
              style={[
                styles.importSelectedButton,
                {
                  backgroundColor: selectedContacts.size > 0 ? colors.tint : '#ccc',
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
            <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Kişi ara..."
              placeholderTextColor={colors.text + '80'}
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

      {/* Message Composition Modal */}
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
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.messageModalHeader}>
              <Ionicons name="chatbubble" size={24} color="#007AFF" />
              <Text style={[styles.messageModalTitle, { color: colors.text }]}>
                Toplu SMS Mesajı
              </Text>
            </View>

            <Text style={[styles.messageModalSubtitle, { color: colors.text }]}>
              {selectedPeople.size} kişiye SMS gönderilecek
            </Text>

            <TextInput
              style={[styles.messageInput, { borderColor: colors.border, color: colors.text }]}
              placeholder="Mesajınızı buraya yazın..."
              placeholderTextColor={colors.text + '80'}
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


    </SafeAreaView>
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
  headerImage: {
    // Deprecated: replaced by headerBackgroundImage
    position: 'absolute',
    top: 10,
    right: -40,
    width: 200,
    height: 200,
    opacity: 0.08,
    transform: [{ rotate: '-10deg' }],
  },
  headerBackgroundImage: {
    position: 'absolute',
    top: -20,
    left: -60,
    width: 300,
    height: 300,
    opacity: 0.15,
    transform: [{ rotate: '-10deg' }],
    zIndex: 0,
  },
  headerTop: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#6B7280',
  },
  importButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '600',
    fontSize: 13,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2196F3',
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '600',
    fontSize: 13,
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
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
    lineHeight: 30,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
  bulkActionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  bulkActionText: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  bulkActionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    flexShrink: 1,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 60,
  },
  bulkActionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  list: {
    flex: 1,
  },
  personCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  personCardSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  personCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  personCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personCheckboxSelected: {
    backgroundColor: '#2196F3',
  },
  personInfo: {
    flex: 1,
  },
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusConfirmed: {
    backgroundColor: '#EBF8FF',
  },
  statusInvited: {
    backgroundColor: '#E3F2FD',
  },
  statusPending: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextConfirmed: {
    color: '#1E40AF',
  },
  statusTextInvited: {
    color: '#1976D2',
  },
  statusTextPending: {
    color: '#6B7280',
  },
  personPhone: {
    fontSize: 14,
    color: '#666666',
  },
  personDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personSide: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2196F3',
  },
  personNotes: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  sideContainer: {
    marginBottom: 15,
  },
  sideLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  sideButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  sideButtonText: {
    color: 'white',
    textAlign: 'center',
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
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  saveButton: {},
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
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
  // Contacts Modal Styles
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
  searchIcon: {
    marginRight: 10,
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 2,
  },
  contactInfo: {
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
  contactSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 15,
  },

  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    alignItems: 'center',
    zIndex: 2,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  fabPrimary: {
    backgroundColor: '#2196F3',
  },
  fabAction: {
    backgroundColor: '#6B7280',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 120,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  fabLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  fabBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  fabBackdropTouchable: {
    flex: 1,
  },
  fabActionContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'center',
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
  contactsBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  messageBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  // Sticky search section
  stickySearchSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    zIndex: 10, // Ensure the sticky header is rendered above list items
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
});
