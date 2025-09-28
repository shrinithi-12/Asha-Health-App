import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { loadStrings } from '../lang/translation';

export default function RoleSelection({ navigation, route }) {
  const { language } = route.params;
  const [lang, setLang] = useState({});

  useEffect(() => {
    const initLang = async () => {
      const strings = await loadStrings(language); // load offline strings
      setLang(strings);
    };
    initLang();
  }, [language]);

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>{lang.selectRole || 'Select Role'}</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#0073e6' }]}
          onPress={() => navigation.navigate('ASHARegistration', { language })}
        >
          <Text style={styles.buttonText}>{lang.asha || 'ASHA'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#00b33c' }]}
          onPress={() => navigation.navigate('PHCRegistration', { language })}
        >
          <Text style={styles.buttonText}>{lang.phc || 'PHC'}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  title: { fontSize: 22, marginBottom: 30, fontWeight: 'bold', textAlign: 'center', color: '#0073e6' },
  button: { paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12, marginVertical: 10, width: '70%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});
