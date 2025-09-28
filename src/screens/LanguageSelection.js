import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { downloadAndSaveLanguage } from '../lang/translation';

export default function LanguageSelection({ navigation }) {
  const [loading, setLoading] = useState(false);

  const selectLanguage = async (langCode) => {
    try {
      setLoading(true);
      await downloadAndSaveLanguage(langCode); // call API & save offline
      setLoading(false);

      // Navigate to next screen
      navigation.replace('RoleSelection', { language: langCode });
    } catch (error) {
      setLoading(false);
      console.error("Error downloading language:", error);
      Alert.alert("Error", "Failed to download language. Please check your internet connection.");
    }
  };

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        <Image source={require('../../assets/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>Select Your Language</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0073e6" />
        ) : (
          <>
            <Button title="English" color="#0073e6" onPress={() => selectLanguage('en')} />
            <View style={{ height: 10 }} />
            <Button title="தமிழ்" color="#00b33c" onPress={() => selectLanguage('ta')} />
          </>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 25,
    width: '85%',
  },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
});
