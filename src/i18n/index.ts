import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files directly
import viTranslations from '../locales/vi.json';
import enTranslations from '../locales/en.json';

// Configuration for i18next
i18n
  .use(LanguageDetector) // Language detection
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    // Resources loaded directly instead of HTTP backend
    resources: {
      vi: {
        translation: viTranslations
      },
      en: {
        translation: enTranslations
      }
    },

    // Language detection options
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language
      caches: ['localStorage'],
    },

    lng: localStorage.getItem('language') || 'vi', // Default language
    fallbackLng: 'vi', // Fallback language
    debug: false,

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Load resources on demand
    load: 'languageOnly',

    // React options
    react: {
      useSuspense: false // Disable suspense for better error handling
    }
  });

export default i18n;