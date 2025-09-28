// src/screens/ChildHealth.js
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

export default function ChildHealth({ navigation, route }) {
  const { language } = route.params;
  const [lang, setLang] = useState({});

  const [clientId, setClientId] = useState('');
  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [immunization, setImmunization] = useState('');
  const [weight, setWeight] = useState('');
  const [village, setVillage] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
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
      const raw = await AsyncStorage.getItem('childHealth');
      const list = raw ? JSON.parse(raw) : [];
      const idNum = (list.length + 1).toString().padStart(5, '0');
      setClientId(`CH${idNum}`);
    };
    generateClientId();
  }, []);

  const saveLocal = async () => {
    if (!childName || !age || !gender || !village || !parentName || !phone) {
      alert(lang?.fillRequired || 'Please fill all required fields');
      return;
    }

    const raw = await AsyncStorage.getItem('childHealth');
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      clientId,
      childName,
      age,
      gender,
      immunization,
      weight,
      village,
      parentName,
      phone,
      bloodGroup,
      status: 'PENDING',
    });
    await AsyncStorage.setItem('childHealth', JSON.stringify(list));
    alert(`${lang?.childHealth || 'Child Health'} ${lang?.savedLocally || 'saved locally'}`);
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

          <Text style={styles.label}>{lang?.childName || 'Child Name'} *</Text>
          <TextInput style={styles.input} value={childName} onChangeText={setChildName} />

          <Text style={styles.label}>{lang?.age || 'Age / DOB'} *</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} />

          <Text style={styles.label}>{lang?.gender || 'Gender'} *</Text>
          <TextInput style={styles.input} value={gender} onChangeText={setGender} />

          <Text style={styles.label}>{lang?.immunization || 'Immunization Status'}</Text>
          <TextInput style={styles.input} value={immunization} onChangeText={setImmunization} />

          <Text style={styles.label}>{lang?.weight || 'Weight / Height / Nutrition'}</Text>
          <TextInput style={styles.input} value={weight} onChangeText={setWeight} />

          <Text style={styles.label}>{lang?.village || 'Village / Area'} *</Text>
          <TextInput style={styles.input} value={village} onChangeText={setVillage} />

          <Text style={styles.label}>{lang?.parentName || 'Parent Name / Contact'} *</Text>
          <TextInput style={styles.input} value={parentName} onChangeText={setParentName} />

          <Text style={styles.label}>{lang?.phone || 'Phone'} *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

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
