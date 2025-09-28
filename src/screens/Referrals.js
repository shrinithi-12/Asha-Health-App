// src/screens/Referrals.js
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncPending } from '../services/syncService';
import { loadStrings } from '../lang/translation';

export default function Referrals({ navigation, route }) {
  const { language } = route.params;
  const [lang, setLang] = useState({});

  const [clientId, setClientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [reason, setReason] = useState('');
  const [referredTo, setReferredTo] = useState('');
  const [referralDate, setReferralDate] = useState('');
  const [village, setVillage] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [notes, setNotes] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  // Load language strings dynamically
  useEffect(() => {
    const initLang = async () => {
      const strings = await loadStrings(language);
      setLang(strings);
    };
    initLang();
  }, [language]);

  // Generate unique client ID
  useEffect(() => {
    const generateClientId = async () => {
      const raw = await AsyncStorage.getItem('referrals');
      const list = raw ? JSON.parse(raw) : [];
      const idNum = (list.length + 1).toString().padStart(5, '0');
      setClientId(`R${idNum}`);
    };
    generateClientId();
  }, []);

  const saveLocal = async () => {
    if (!patientName || !reason || !referredTo || !village) {
      alert(lang?.fillRequired || 'Please fill all required fields');
      return;
    }

    const raw = await AsyncStorage.getItem('referrals');
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      clientId,
      patientName,
      age,
      gender,
      reason,
      referredTo,
      referralDate,
      village,
      followUp,
      notes,
      bloodGroup,
      status: 'PENDING',
    });

    await AsyncStorage.setItem('referrals', JSON.stringify(list));
    alert(`${lang?.referrals || 'Referrals'} ${lang?.savedLocally || 'saved locally'}`);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.label}>{lang?.clientId || 'Client ID'}</Text>
          <Text style={styles.clientId}>{clientId}</Text>

          <Text style={styles.label}>{lang?.patientName || 'Patient Name'} *</Text>
          <TextInput style={styles.input} value={patientName} onChangeText={setPatientName} />

          <Text style={styles.label}>{lang?.age || 'Age'}</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} />

          <Text style={styles.label}>{lang?.gender || 'Gender'}</Text>
          <TextInput style={styles.input} value={gender} onChangeText={setGender} />

          <Text style={styles.label}>{lang?.reason || 'Reason for Referral'} *</Text>
          <TextInput style={styles.input} value={reason} onChangeText={setReason} />

          <Text style={styles.label}>{lang?.referredTo || 'Referred To'} *</Text>
          <TextInput style={styles.input} value={referredTo} onChangeText={setReferredTo} />

          <Text style={styles.label}>{lang?.referralDate || 'Referral Date'}</Text>
          <TextInput style={styles.input} value={referralDate} onChangeText={setReferralDate} />

          <Text style={styles.label}>{lang?.village || 'Village / Area'} *</Text>
          <TextInput style={styles.input} value={village} onChangeText={setVillage} />

          <Text style={styles.label}>{lang?.followUp || 'Follow-up Status'}</Text>
          <TextInput style={styles.input} value={followUp} onChangeText={setFollowUp} />

          <Text style={styles.label}>{lang?.notes || 'ASHA Notes'}</Text>
          <TextInput style={styles.input} value={notes} onChangeText={setNotes} />

          <Text style={styles.label}>{lang?.bloodGroup || 'Blood Group'}</Text>
          <TextInput style={styles.input} value={bloodGroup} onChangeText={setBloodGroup} />

          <Button title={lang?.saveLocally || 'Save Locally'} color="#00b33c" onPress={saveLocal} />
          <View style={{ height: 10 }} />
          <Button title={lang?.syncNow || 'Sync Now'} color="#0073e6" onPress={() => syncPending()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fff0' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#00b33c',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
  },
  label: { fontWeight: 'bold', marginBottom: 4, color: '#00b33c' },
  clientId: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#00b33c' },
});
