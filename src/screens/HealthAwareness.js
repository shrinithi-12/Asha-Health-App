// src/screens/HealthAwareness.js
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

export default function HealthAwareness({ navigation, route }) {
  const { language } = route.params;
  const [lang, setLang] = useState({});

  const [clientId, setClientId] = useState('');
  const [topic, setTopic] = useState('');
  const [targetGroup, setTargetGroup] = useState('');
  const [dateConducted, setDateConducted] = useState('');
  const [location, setLocation] = useState('');
  const [participants, setParticipants] = useState('');
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
      const raw = await AsyncStorage.getItem('healthAwareness');
      const list = raw ? JSON.parse(raw) : [];
      const idNum = (list.length + 1).toString().padStart(5, '0');
      setClientId(`HA${idNum}`);
    };
    generateClientId();
  }, []);

  const saveLocal = async () => {
    if (!topic || !targetGroup || !location) {
      alert(lang?.fillRequired || 'Please fill all required fields');
      return;
    }

    const raw = await AsyncStorage.getItem('healthAwareness');
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      clientId,
      topic,
      targetGroup,
      dateConducted,
      location,
      participants,
      notes,
      bloodGroup,
      status: 'COMPLETED',
    });
    await AsyncStorage.setItem('healthAwareness', JSON.stringify(list));
    alert(`${lang?.healthAwareness || 'Health Awareness'} ${lang?.savedLocally || 'saved locally'}`);
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

          <Text style={styles.label}>{lang?.topic || 'Topic / Campaign Name'} *</Text>
          <TextInput style={styles.input} value={topic} onChangeText={setTopic} />

          <Text style={styles.label}>{lang?.targetGroup || 'Target Group'} *</Text>
          <TextInput style={styles.input} value={targetGroup} onChangeText={setTargetGroup} />

          <Text style={styles.label}>{lang?.dateConducted || 'Date Conducted'}</Text>
          <TextInput style={styles.input} value={dateConducted} onChangeText={setDateConducted} />

          <Text style={styles.label}>{lang?.location || 'Location / Village'} *</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} />

          <Text style={styles.label}>{lang?.participants || 'Number of Participants'}</Text>
          <TextInput
            style={styles.input}
            value={participants}
            onChangeText={setParticipants}
            keyboardType="numeric"
          />

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
