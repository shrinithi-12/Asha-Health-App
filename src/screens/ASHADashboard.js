// src/screens/ASHADashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { loadStrings } from '../lang/translation';

export default function ASHADashboard({ navigation, route }) {
  const [language, setLanguage] = useState('en'); // default English
  const [lang, setLang] = useState({}); // translation strings

  const [profile, setProfile] = useState({
    name: '',
    ashaId: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    village: '',
    householdsVisited: 0,
    pendingTasks: 0,
    recentVisits: 0,
  });

  const [profileTemp, setProfileTemp] = useState(profile);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [patientsByModule, setPatientsByModule] = useState({});

  // Load language strings and persist
  useEffect(() => {
    const initLanguage = async () => {
      let langParam = route?.params?.language;
      if (!langParam) {
        const storedLang = await AsyncStorage.getItem('selectedLanguage');
        langParam = storedLang || 'en';
      }
      setLanguage(langParam);
      const strings = await loadStrings(langParam);
      setLang(strings);
    };
    initLanguage();
  }, [route]);

  // Load profile for current ASHA
  const loadProfile = async () => {
    const currentAshaId = await AsyncStorage.getItem('currentUser');
    if (!currentAshaId) return;

    const raw = await AsyncStorage.getItem(`ashaProfile_${currentAshaId}`);
    if (raw) {
      const p = JSON.parse(raw);
      setProfile({ ...p, householdsVisited: 0, pendingTasks: 0, recentVisits: 0 });
      setProfileTemp(p);
    } else {
      const emptyProfile = { name: '', ashaId: currentAshaId, dob: '', gender: '', phone: '', email: '', village: '' };
      setProfile({ ...emptyProfile, householdsVisited: 0, pendingTasks: 0, recentVisits: 0 });
      setProfileTemp(emptyProfile);
    }
  };

  // Load patients grouped by module
  const loadPatients = async () => {
    const modules = ['pregnancy', 'childHealth', 'familyPlanning', 'diseaseSurveillance', 'referrals', 'healthAwareness'];
    let grouped = {};
    let allPatientsCount = 0;
    let pendingCount = 0;

    for (let mod of modules) {
      const raw = await AsyncStorage.getItem(mod);
      if (raw) {
        const arr = JSON.parse(raw).map((i, idx) => ({
          clientId: i.clientId || `${mod.substring(0, 1).toUpperCase()}${String(idx + 1).padStart(5, '0')}`,
          bloodGroup: i.bloodGroup || '',
          module: mod,
          ...i,
        }));
        grouped[mod] = arr;
        allPatientsCount += arr.length;
        pendingCount += arr.filter(p => p.status === 'PENDING').length;
      } else {
        grouped[mod] = [];
      }
    }

    setPatientsByModule(grouped);
    setProfile(prev => ({
      ...prev,
      householdsVisited: allPatientsCount,
      pendingTasks: pendingCount,
      recentVisits: allPatientsCount ? 5 : 0,
    }));
  };

  // Switch ASHA ID
  const switchAsha = async (newAshaId) => {
    await AsyncStorage.setItem('currentUser', newAshaId);
    await loadProfile();
    await loadPatients();
  };

  // Refresh profile & patients when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
      loadPatients();
    });
    return unsubscribe;
  }, [navigation]);

  // Save profile updates
  const saveProfile = async () => {
    const currentAshaId = await AsyncStorage.getItem('currentUser');
    if (!currentAshaId) return;

    const updatedProfile = { ...profile, ...profileTemp };
    await AsyncStorage.setItem(`ashaProfile_${currentAshaId}`, JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    setProfileModalVisible(false);

    loadPatients();
  };

  const CardButton = ({ title, color, onPress }) => (
    <TouchableOpacity style={[styles.cardButton, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.cardButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  const moduleNames = {
    pregnancy: lang?.registerPregnancy || 'Register Pregnancy',
    childHealth: lang?.childHealth || 'Child Health',
    familyPlanning: lang?.familyPlanning || 'Family Planning',
    diseaseSurveillance: lang?.diseaseSurveillance || 'Disease Surveillance',
    referrals: lang?.referrals || 'Referrals',
    healthAwareness: lang?.healthAwareness || 'Health Awareness',
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcome}>{lang?.welcome || 'Welcome'}, {profile.name}</Text>
          <Text style={styles.stats}>{lang?.householdsVisited || 'Households Visited'}: {profile.householdsVisited}</Text>
          <Text style={styles.stats}>{lang?.pendingTasks || 'Pending Tasks'}: {profile.pendingTasks}</Text>
          <Text style={styles.stats}>{lang?.recentVisits || 'Recent Visits'}: {profile.recentVisits}</Text>
          <Text style={styles.stats}>{lang?.area || 'Area'}: {profile.village}</Text>
        </View>
        <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
          <View style={styles.profilePlaceholder}>
            <AntDesign name="user" size={30} color="#0073e6" />
          </View>
          <Text style={styles.editText}>{lang?.profile || 'Profile'}</Text>
        </TouchableOpacity>
      </View>

      {/* Patients grouped by module */}
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        {Object.keys(patientsByModule).map((mod) => (
          <View key={mod}>
            {patientsByModule[mod].length > 0 && (
              <>
                <Text style={styles.moduleHeader}>{moduleNames[mod]}</Text>
                {patientsByModule[mod].map((p, idx) => (
                  <View key={idx} style={styles.card}>
                    <Text style={styles.cardTitle}>{p.name || p.childName || p.coupleName || p.patientName || 'Unknown'}</Text>
                    <Text style={styles.cardSubtitle}>Client ID: {p.clientId} | Blood Group: {p.bloodGroup}</Text>
                    {p.age && <Text>Age: {p.age}</Text>}
                    {p.gender && <Text>Gender: {p.gender}</Text>}
                    {p.phone && <Text>Phone: {p.phone}</Text>}
                    {p.village && <Text>Village: {p.village}</Text>}
                    {p.status && <Text>Status: {p.status}</Text>}
                  </View>
                ))}
              </>
            )}
          </View>
        ))}
        {Object.values(patientsByModule).every(arr => arr.length === 0) &&
          <Text style={{ textAlign: 'center', marginTop: 20 }}>{lang?.noEntries || 'No entries yet'}</Text>
        }
      </ScrollView>

      {/* Floating "+" button */}
      <TouchableOpacity style={styles.floatingButton} onPress={() => setModalVisible(true)}>
        <AntDesign name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modules modal */}
      <Modal transparent animationType="slide" visible={modalVisible}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{lang?.addNewEntry || 'Add New Entry'}</Text>
          <CardButton title={moduleNames.pregnancy} color="#0073e6" onPress={() => { setModalVisible(false); navigation.navigate('RegisterPregnancy', { language }); }} />
          <CardButton title={moduleNames.childHealth} color="#00b33c" onPress={() => { setModalVisible(false); navigation.navigate('ChildHealth', { language }); }} />
          <CardButton title={moduleNames.familyPlanning} color="#0073e6" onPress={() => { setModalVisible(false); navigation.navigate('FamilyPlanning', { language }); }} />
          <CardButton title={moduleNames.diseaseSurveillance} color="#00b33c" onPress={() => { setModalVisible(false); navigation.navigate('DiseaseSurveillance', { language }); }} />
          <CardButton title={moduleNames.referrals} color="#0073e6" onPress={() => { setModalVisible(false); navigation.navigate('Referrals', { language }); }} />
          <CardButton title={moduleNames.healthAwareness} color="#00b33c" onPress={() => { setModalVisible(false); navigation.navigate('HealthAwareness', { language }); }} />
        </View>
      </Modal>

      {/* Profile edit modal */}
      <Modal transparent animationType="slide" visible={profileModalVisible}>
        <TouchableWithoutFeedback onPress={() => setProfileModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <ScrollView>
            {['name','ashaId','age','gender','bloodGroup','phone','email','village'].map((key) => (
              <View key={key} style={{ marginBottom: 12 }}>
                <Text style={{ color: '#0073e6', fontWeight: 'bold', marginBottom: 4 }}>{key}</Text>
                <TextInput
                  style={styles.input}
                  value={String(profileTemp[key] || '')}
                  onChangeText={(text) => setProfileTemp({ ...profileTemp, [key]: text })}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
              <Text style={styles.saveButtonText}>{lang?.saveProfile || 'Save Profile'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f0f8ff' },
  welcome: { fontSize: 20, fontWeight: 'bold', color: '#0073e6' },
  stats: { fontSize: 14, color: '#00b33c', marginTop: 2 },
  profilePlaceholder: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#0073e6', justifyContent: 'center', alignItems: 'center' },
  editText: { fontSize: 12, color: '#0073e6', textAlign: 'center' },
  container: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },
  floatingButton: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#0073e6', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#f0f8ff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  cardButton: { padding: 16, borderRadius: 10, marginVertical: 6, alignItems: 'center' },
  cardButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#0073e6' },
  moduleHeader: { fontSize: 18, fontWeight: 'bold', color: '#0073e6', marginVertical: 8 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, width: '100%', maxWidth: 360, alignSelf: 'center' },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#0073e6', flexShrink: 1 },
  cardSubtitle: { fontSize: 14, color: '#00b33c', flexShrink: 1 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 12 },
  saveButton: { backgroundColor: '#0073e6', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
