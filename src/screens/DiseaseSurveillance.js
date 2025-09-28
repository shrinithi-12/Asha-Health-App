// src/screens/DiseaseSurveillance.js
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

export default function DiseaseSurveillance({ navigation, route }) {
  const { language } = route.params;
  const [lang, setLang] = useState({});

  const [clientId, setClientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [disease, setDisease] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [village, setVillage] = useState('');
  const [notes, setNotes] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  // Load language strings
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
      const raw = await AsyncStorage.getItem('diseaseSurveillance');
      const list = raw ? JSON.parse(raw) : [];
      const idNum = (list.length + 1).toString().padStart(5, '0');
      setClientId(`DS${idNum}`);
    };
    generateClientId();
  }, []);

  const saveLocal = async () => {
    if (!patientName || !age || !gender || !village) {
      alert(lang?.fillRequired || 'Please fill all required fields');
      return;
    }

    const raw = await AsyncStorage.getItem('diseaseSurveillance');
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      clientId,
      patientName,
      age,
      gender,
      disease,
      reportDate,
      village,
      notes,
      bloodGroup,
      status: 'PENDING',
    });
    await AsyncStorage.setItem('diseaseSurveillance', JSON.stringify(list));
    alert(`${lang?.diseaseSurveillance || 'Disease Surveillance'} ${lang?.savedLocally || 'saved locally'}`);
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

          <Text style={styles.label}>{lang?.age || 'Age'} *</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} />

          <Text style={styles.label}>{lang?.gender || 'Gender'} *</Text>
          <TextInput style={styles.input} value={gender} onChangeText={setGender} />

          <Text style={styles.label}>{lang?.disease || 'Disease / Symptoms'}</Text>
          <TextInput style={styles.input} value={disease} onChangeText={setDisease} />

          <Text style={styles.label}>{lang?.reportDate || 'Date of Report'}</Text>
          <TextInput style={styles.input} value={reportDate} onChangeText={setReportDate} />

          <Text style={styles.label}>{lang?.village || 'Village / Area'} *</Text>
          <TextInput style={styles.input} value={village} onChangeText={setVillage} />

          <Text style={styles.label}>{lang?.ashaNotes || 'ASHA Notes'}</Text>
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
