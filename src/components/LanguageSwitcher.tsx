import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, type Language } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

interface LanguageOption {
  code: Language;
  name: string;
  shortCode: string;
}

// const languages: LanguageOption[] = [
//   { code: 'vi', name: 'Tiếng Việt', shortCode: 'VN' },
//   { code: 'en', name: 'English', shortCode: 'US' },
// ];
const languages: LanguageOption[] = [
    { code: 'vi' as const, name: 'Tiếng Việt', shortCode: '🇻🇳' },
    { code: 'en' as const, name: 'English', shortCode: '🇺🇸' },
  ];

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangData = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = async (lang: Language) => {
    await changeLanguage(lang);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          flex items-center gap-1.5 px-2 py-1.5 rounded-lg
          hover:bg-gray-100 transition-colors duration-200
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none
        `}
        aria-label={t('user.language')}
      >
        <GlobeAltIcon className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700 lowercase">
          {isLoading ? '...' : currentLangData.shortCode}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isLoading || lang.code === currentLanguage}
              className={`
                w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors duration-150
                ${lang.code === currentLanguage
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                disabled:cursor-not-allowed
              `}
            >
              <span className="text-sm font-medium">{lang.name}</span>
              {lang.code === currentLanguage && (
                <svg
                  className="w-4 h-4 text-blue-600 ml-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};