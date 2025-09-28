// src/screens/RegisterPregnancy.js
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

export default function RegisterPregnancy({ navigation, route }) {
  const { language } = route.params;
  const [lang, setLang] = useState({});

  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [edd, setEdd] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [notes, setNotes] = useState('');

  // Load language strings
  useEffect(() => {
    const initLang = async () => {
      const strings = await loadStrings(language);
      setLang(strings);
    };
    initLang();
  }, [language]);

  // Generate unique Client ID
  useEffect(() => {
    const generateClientId = async () => {
      const raw = await AsyncStorage.getItem('pregnancy');
      const list = raw ? JSON.parse(raw) : [];
      const idNum = (list.length + 1).toString().padStart(5, '0');
      setClientId(`P${idNum}`);
    };
    generateClientId();
  }, []);

  const saveLocal = async () => {
    if (!name || !age || !bloodGroup || !edd || !phone || !village) {
      alert(lang?.fillRequired || 'Please fill all required fields');
      return;
    }

    const raw = await AsyncStorage.getItem('pregnancy');
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      clientId,
      name,
      age,
      bloodGroup,
      edd,
      phone,
      village,
      notes,
      status: 'PENDING',
    });

    await AsyncStorage.setItem('pregnancy', JSON.stringify(list));
    alert(`${lang?.registerPregnancy || 'Register Pregnancy'} ${lang?.savedLocally || 'saved locally'}`);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.card}>
          <Text style={styles.label}>{lang?.clientId || 'Client ID'}</Text>
          <Text style={styles.clientId}>{clientId}</Text>

          <Text style={styles.label}>{lang?.motherName || 'Mother Name'} *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>{lang?.age || 'Age'} *</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />

          <Text style={styles.label}>{lang?.bloodGroup || 'Blood Group'} *</Text>
          <TextInput style={styles.input} value={bloodGroup} onChangeText={setBloodGroup} />

          <Text style={styles.label}>{lang?.edd || 'Expected Delivery Date'} *</Text>
          <TextInput style={styles.input} value={edd} onChangeText={setEdd} placeholder="DD/MM/YYYY" />

          <Text style={styles.label}>{lang?.phone || 'Phone Number'} *</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={styles.label}>{lang?.village || 'Village / Area'} *</Text>
          <TextInput style={styles.input} value={village} onChangeText={setVillage} />

          <Text style={styles.label}>{lang?.notes || 'ASHA Notes / High-Risk Status'}</Text>
          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            placeholder={lang?.notesPlaceholder || 'Optional notes'}
          />

          <Button title={lang?.saveLocally || 'Save Locally'} color="#00b33c" onPress={saveLocal} />
          <View style={{ height: 10 }} />
          <Button title={lang?.syncNow || 'Sync Now'} color="#0073e6" onPress={() => syncPending()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fff0', padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  label: { fontWeight: 'bold', marginBottom: 4, color: '#00b33c' },
  input: { borderWidth: 1, borderColor: '#00b33c', borderRadius: 8, marginBottom: 12, padding: 10 },
  clientId: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#00b33c' },
});
