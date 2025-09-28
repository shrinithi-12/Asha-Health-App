// src/screens/PHCDashboard.js
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
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { loadStrings } from '../lang/translation';

export default function PHCDashboard({ navigation, route }) {
  const { language } = route.params;
  const [lang, setLang] = useState({});

  const [profile, setProfile] = useState({
    fullName: '',
    phcId: '',
    designation: '',
    phone: '',
    email: '',
    areaCovered: '',
    age: '',
    bloodGroup: '',
  });
  const [profileTemp, setProfileTemp] = useState(profile);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const [ashaCount, setAshaCount] = useState(0);
  const [householdsCount, setHouseholdsCount] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [recentActivities, setRecentActivities] = useState(0);

  // Load language strings
  useEffect(() => {
    const initLang = async () => {
      const strings = await loadStrings(language);
      setLang(strings);
    };
    initLang();
  }, [language]);

  // Load PHC Profile
  const loadProfile = async () => {
    const raw = await AsyncStorage.getItem('phcProfile');
    if (raw) {
      const p = JSON.parse(raw);
      setProfile(p);
      setProfileTemp(p);
    }
  };

  // Load stats from ASHA workers
  const loadStats = async () => {
    const rawASHAs = await AsyncStorage.getItem('ashaList');
    const ashaList = rawASHAs ? JSON.parse(rawASHAs) : [];
    setAshaCount(ashaList.length);

    let totalHouseholds = 0;
    let totalPending = 0;
    let totalRecent = 0;

    for (let asha of ashaList) {
      const modules = [
        'pregnancy',
        'childHealth',
        'familyPlanning',
        'diseaseSurveillance',
        'referrals',
        'healthAwareness',
      ];
      for (let mod of modules) {
        const raw = await AsyncStorage.getItem(mod);
        if (raw) {
          const data = JSON.parse(raw).filter((d) => d.ashaId === asha.ashaId);
          totalHouseholds += data.length;
          totalPending += data.filter((d) => d.status === 'PENDING').length;
          totalRecent += data.length ? 3 : 0;
        }
      }
    }

    setHouseholdsCount(totalHouseholds);
    setPendingTasks(totalPending);
    setRecentActivities(totalRecent);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
      loadStats();
    });
    return unsubscribe;
  }, [navigation]);

  const saveProfile = async () => {
    await AsyncStorage.setItem('phcProfile', JSON.stringify(profileTemp));
    setProfile(profileTemp);
    setProfileModalVisible(false);
  };

  // Stat Card Component
  const StatCard = ({ icon, label, value, bgColor }) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  // Module Button Component
  const ModuleButton = ({ title, icon, onPress, bgColor }) => (
    <TouchableOpacity style={[styles.moduleButton, { backgroundColor: bgColor }]} onPress={onPress}>
      {icon}
      <Text style={styles.moduleText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* PHC Profile Card */}
        <View style={styles.profileCard}>
          <View>
            <Text style={styles.profileName}>{profile.fullName || lang?.phcStaffName || 'PHC Staff Name'}</Text>
            <Text style={styles.profileInfo}>{lang?.id || 'ID'}: {profile.phcId || '-'}</Text>
            <Text style={styles.profileInfo}>{lang?.designation || 'Designation'}: {profile.designation || '-'}</Text>
            <Text style={styles.profileInfo}>{lang?.phone || 'Phone'}: {profile.phone || '-'}</Text>
            {profile.email ? <Text style={styles.profileInfo}>{lang?.email || 'Email'}: {profile.email}</Text> : null}
            <Text style={styles.profileInfo}>{lang?.areaCovered || 'Area Covered'}: {profile.areaCovered || '-'}</Text>
            <Text style={styles.profileInfo}>{lang?.age || 'Age'}: {profile.age || '-'}</Text>
            <Text style={styles.profileInfo}>{lang?.bloodGroup || 'Blood Group'}: {profile.bloodGroup || '-'}</Text>
          </View>
          <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
            <AntDesign name="edit" size={28} color="#34495e" />
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <StatCard
            icon={<MaterialIcons name="groups" size={24} color="#fff" />}
            label={lang?.ashas || 'ASHAs'}
            value={ashaCount}
            bgColor="#4D6FA9"
          />
          <StatCard
            icon={<MaterialIcons name="home" size={24} color="#fff" />}
            label={lang?.households || 'Households'}
            value={householdsCount}
            bgColor="#48B8A0"
          />
          <StatCard
            icon={<MaterialIcons name="pending-actions" size={24} color="#fff" />}
            label={lang?.pendingTasks || 'Pending Tasks'}
            value={pendingTasks}
            bgColor="#F4A261"
          />
          <StatCard
            icon={<MaterialIcons name="history" size={24} color="#fff" />}
            label={lang?.recentActivities || 'Recent Activities'}
            value={recentActivities}
            bgColor="#9B5DE5"
          />
        </View>

        {/* Modules Navigation */}
        <Text style={styles.sectionTitle}>{lang?.modules || 'Modules'}</Text>
        <View style={styles.modulesContainer}>
          <ModuleButton
            title={lang?.ashaList || 'ASHA List'}
            icon={<MaterialIcons name="person" size={24} color="#fff" />}
            onPress={() => navigation.navigate('ASHAList', { language })}
            bgColor="#4D6FA9"
          />
          <ModuleButton
            title={lang?.pregnancy || 'Pregnancy'}
            icon={<MaterialIcons name="pregnant-woman" size={24} color="#fff" />}
            onPress={() => navigation.navigate('PregnancyOverview', { language })}
            bgColor="#48B8A0"
          />
          <ModuleButton
            title={lang?.childHealth || 'Child Health'}
            icon={<MaterialIcons name="child-care" size={24} color="#fff" />}
            onPress={() => navigation.navigate('ChildHealthOverview', { language })}
            bgColor="#F4A261"
          />
          <ModuleButton
            title={lang?.familyPlanning || 'Family Planning'}
            icon={<MaterialIcons name="family-restroom" size={24} color="#fff" />}
            onPress={() => navigation.navigate('FamilyPlanningOverview', { language })}
            bgColor="#9B5DE5"
          />
          <ModuleButton
            title={lang?.diseaseSurveillance || 'Disease Surveillance'}
            icon={<MaterialIcons name="coronavirus" size={24} color="#fff" />}
            onPress={() => navigation.navigate('DiseaseSurveillanceOverview', { language })}
            bgColor="#00A6FB"
          />
          <ModuleButton
            title={lang?.referrals || 'Referrals'}
            icon={<MaterialIcons name="healing" size={24} color="#fff" />}
            onPress={() => navigation.navigate('ReferralsOverview', { language })}
            bgColor="#FF6B6B"
          />
        </View>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal transparent animationType="slide" visible={profileModalVisible}>
        <TouchableWithoutFeedback onPress={() => setProfileModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {[
              { key: 'fullName', label: lang?.fullName || 'Full Name' },
              { key: 'phcId', label: lang?.phcId || 'PHC ID' },
              { key: 'designation', label: lang?.designation || 'Designation' },
              { key: 'phone', label: lang?.phone || 'Phone' },
              { key: 'email', label: lang?.email || 'Email' },
              { key: 'areaCovered', label: lang?.areaCovered || 'Area Covered' },
              { key: 'age', label: lang?.age || 'Age' },
              { key: 'bloodGroup', label: lang?.bloodGroup || 'Blood Group' },
            ].map((field) => (
              <View key={field.key} style={styles.profileRow}>
                <Text style={styles.profileLabel}>{field.label}</Text>
                <TextInput
                  style={styles.profileValueInput}
                  value={profileTemp[field.key] || ''}
                  onChangeText={(text) => setProfileTemp({ ...profileTemp, [field.key]: text })}
                  placeholder={`Enter ${field.label}`}
                  placeholderTextColor="#95A5A6"
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  profileName: { fontSize: 20, fontWeight: '700', color: '#2C3E50' },
  profileInfo: { fontSize: 14, color: '#7F8C8D', marginTop: 4 },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: 16 },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statLabel: { color: '#fff', fontSize: 14, marginTop: 6 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2C3E50', marginLeft: 16, marginTop: 20, marginBottom: 12 },
  modulesContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: 16 },
  moduleButton: { width: '48%', padding: 16, borderRadius: 12, marginVertical: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  moduleText: { color: '#fff', fontWeight: '600', fontSize: 16, marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#F8F9FA', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  profileRow: { marginBottom: 14 },
  profileLabel: { fontWeight: 'bold', color: '#2C3E50', fontSize: 15 },
  profileValueInput: { borderWidth: 1, borderColor: '#BDC3C7', borderRadius: 8, padding: 10, marginTop: 4, backgroundColor: '#fff', color: '#2C3E50', fontSize: 15 },
  saveButton: { backgroundColor: '#34495E', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
