import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultStrings } from './defaultStrings';

const fetchTranslateAPI = async (text, targetLang) => {
  try {
    const res = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "en", target: targetLang })
    });
    const data = await res.json();
    return data.translatedText;
  } catch (err) {
    console.error("Translation error:", err);
    return text; // fallback
  }
};

export const downloadAndSaveLanguage = async (targetLang) => {
  const translatedStrings = {};
  for (let key in defaultStrings) {
    translatedStrings[key] = await fetchTranslateAPI(defaultStrings[key], targetLang);
  }
  await AsyncStorage.setItem(`lang_${targetLang}`, JSON.stringify(translatedStrings));
  await AsyncStorage.setItem("selectedLanguage", targetLang);
  return translatedStrings;
};

export const loadStrings = async (langCode) => {
  const selectedLang = langCode || (await AsyncStorage.getItem("selectedLanguage")) || "en";
  const raw = await AsyncStorage.getItem(`lang_${selectedLang}`);
  if (!raw) return defaultStrings;
  return JSON.parse(raw);
};
