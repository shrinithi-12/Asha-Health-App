// src/screens/ASHARegistration.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { loadStrings } from '../lang/translation';

export default function ASHARegistration({ navigation }) {
  const [lang, setLang] = useState({});

  const [name, setName] = useState('');
  const [ashaId, setAshaId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [village, setVillage] = useState('');
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // States for login modal
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loginAshaId, setLoginAshaId] = useState('');

  useEffect(() => {
    const initLang = async () => {
      const strings = await loadStrings();
      setLang(strings);
    };
    initLang();

    const checkRegistered = async () => {
      const currentUserId = await AsyncStorage.getItem('currentUser');
      if (currentUserId) setAlreadyRegistered(true);
    };
    checkRegistered();
  }, []);

  const registerASHA = async () => {
    if (!name || !ashaId || !age || !phone || !village) {
      alert(lang.fillAllFields || 'Please fill all required fields');
      return;
    }

    const data = { name, ashaId, age, gender, bloodGroup, phone, email, village };

    await AsyncStorage.setItem(`ashaProfile_${ashaId}`, JSON.stringify(data));
    await AsyncStorage.setItem('currentUser', ashaId);

    navigation.replace('ASHADashboard');
  };

  // Open login modal
  const loginExistingASHA = () => {
    setLoginModalVisible(true);
  };

  const handleLogin = async () => {
    if (!loginAshaId) return;
    const stored = await AsyncStorage.getItem(`ashaProfile_${loginAshaId}`);
    if (!stored) {
      alert(lang.invalidASHAID || 'Invalid ASHA ID');
      return;
    }
    await AsyncStorage.setItem('currentUser', loginAshaId);
    setLoginModalVisible(false);
    navigation.replace('ASHADashboard');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{lang.ashaRegistration || 'ASHA Registration'}</Text>

      <Text style={styles.label}>{lang.fullName || 'Full Name'} *</Text>
      <TextInput
        style={styles.input}
        placeholder={lang.enterFullName || 'Enter full name'}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>{lang.ashaId || 'ASHA ID'} *</Text>
      <TextInput
        style={styles.input}
        placeholder={lang.enterASHAID || 'Enter your ASHA ID'}
        value={ashaId}
        onChangeText={setAshaId}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>{lang.age || 'Age'} *</Text>
          <TextInput
            style={[styles.input, { height: 50 }]}
            placeholder={lang.enterAge || 'Enter age'}
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>{lang.gender || 'Gender'} *</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={gender} onValueChange={(itemValue) => setGender(itemValue)}>
              <Picker.Item label={lang.female || 'Female'} value="Female" />
              <Picker.Item label={lang.male || 'Male'} value="Male" />
              <Picker.Item label={lang.other || 'Other'} value="Other" />
            </Picker>
          </View>
        </View>
      </View>

      <Text style={styles.label}>{lang.bloodGroup || 'Blood Group'} *</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={bloodGroup} onValueChange={(itemValue) => setBloodGroup(itemValue)}>
          <Picker.Item label="A+" value="A+" />
          <Picker.Item label="A-" value="A-" />
          <Picker.Item label="B+" value="B+" />
          <Picker.Item label="B-" value="B-" />
          <Picker.Item label="O+" value="O+" />
          <Picker.Item label="O-" value="O-" />
          <Picker.Item label="AB+" value="AB+" />
          <Picker.Item label="AB-" value="AB-" />
        </Picker>
      </View>

      <Text style={styles.label}>{lang.phone || 'Phone Number'} *</Text>
      <TextInput
        style={styles.input}
        placeholder={lang.enterPhone || 'Enter mobile number'}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Text style={styles.label}>{lang.email || 'Email (Optional)'}</Text>
      <TextInput
        style={styles.input}
        placeholder={lang.enterEmail || 'Enter email'}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>{lang.village || 'Village / Area'} *</Text>
      <TextInput
        style={styles.input}
        placeholder={lang.enterVillage || 'Enter village/area'}
        value={village}
        onChangeText={setVillage}
      />

      <Button
        title={lang.registerASHA || 'Register ASHA'}
        color="#0073e6"
        onPress={registerASHA}
      />

      {alreadyRegistered && (
        <TouchableOpacity style={{ marginTop: 20 }} onPress={loginExistingASHA}>
          <Text style={{ color: '#00b33c', textAlign: 'center', fontWeight: 'bold' }}>
            {lang.alreadyRegistered || 'Already Registered? Go to Dashboard'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Login modal */}
      <Modal transparent visible={loginModalVisible} animationType="slide">
        <View style={styles.loginModal}>
          <View style={{ backgroundColor: '#f0f8ff', padding: 20, borderRadius: 10, width: '100%' }}>
            <Text style={styles.modalTitle}>{lang.enterASHAID || 'Enter ASHA ID'}</Text>
            <TextInput
              style={styles.input}
              placeholder={lang.ASHAID || 'ASHA ID'}
              value={loginAshaId}
              onChangeText={setLoginAshaId}
            />
            <Button title={lang.login || 'Login'} onPress={handleLogin} />
            <View style={{ height: 10 }} />
            <Button title={lang.cancel || 'Cancel'} color="red" onPress={() => setLoginModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, backgroundColor: '#f0f8ff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#0073e6', textAlign: 'center' },
  label: { fontWeight: 'bold', marginBottom: 4, color: '#0073e6' },
  input: { borderWidth: 1, borderColor: '#0073e6', borderRadius: 8, marginBottom: 12, padding: 10 },
  pickerContainer: { borderWidth: 1, borderColor: '#0073e6', borderRadius: 8, marginBottom: 12, height: 50, justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { flex: 1, marginRight: 8 },
  loginModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0073e6', marginBottom: 12, textAlign: 'center' },
});
