import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../modules/auth/services/apiClient';

export type Language = 'vi' | 'en';

type LanguageChangeCallback = () => void;

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (lang: Language) => void;
  isLoading: boolean;
  onLanguageChange: (callback: LanguageChangeCallback) => () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Safe access to localStorage for SSR
    if (typeof window === 'undefined') {
      return 'vi';
    }
    try {
      const savedLang = localStorage.getItem('language');
      return (savedLang as Language) || 'vi';
    } catch (error) {
      console.warn('Failed to access localStorage for language:', error);
      return 'vi';
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [callbacks, setCallbacks] = useState<Set<LanguageChangeCallback>>(new Set());

  const onLanguageChange = (callback: LanguageChangeCallback): (() => void) => {
    setCallbacks(prev => new Set(prev).add(callback));

    return () => {
      setCallbacks(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  };

  const changeLanguage = async (lang: Language) => {
    if (lang === currentLanguage) return;

    setIsLoading(true);

    try {
      // Update i18next language - this will trigger loading of the new language resources
      await i18n.changeLanguage(lang);

      // Update local state
      setCurrentLanguage(lang);

      // Save to localStorage (safe for SSR)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('language', lang);
        } catch (error) {
          console.warn('Failed to save language to localStorage:', error);
        }
      }

      // Call all registered callbacks to refresh data
      callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in language change callback:', error);
        }
      });
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true);

      try {
        // Make sure i18n is initialized first
        if (!i18n.isInitialized) {
          await new Promise((resolve) => {
            i18n.on('initialized', resolve);
          });
        }

        // Set i18next language
        await i18n.changeLanguage(currentLanguage);

        // Update API client header
        if (apiClient?.defaults?.headers) {
          apiClient.defaults.headers['Accept-Language'] = currentLanguage;
        }
      } catch (error) {
        console.error('Error initializing language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [i18n, currentLanguage]);

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    isLoading,
    onLanguageChange,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};