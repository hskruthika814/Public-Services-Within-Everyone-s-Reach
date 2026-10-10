import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  language: 'en' | 'kn';
  setLanguage: (lang: 'en' | 'kn') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(
    (localStorage.getItem('fontSize') as any) || 'normal'
  );
  const [highContrast, setHighContrast] = useState<boolean>(
    localStorage.getItem('highContrast') === 'true'
  );
  const [language, setLanguage] = useState<'en' | 'kn'>(
    (localStorage.getItem('language') as any) || 'en'
  );

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    const html = document.documentElement;
    html.classList.remove('text-base', 'text-lg', 'text-xl');
    if (fontSize === 'normal') html.classList.add('text-base');
    if (fontSize === 'large') html.classList.add('text-lg');
    if (fontSize === 'xlarge') html.classList.add('text-xl');
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('highContrast', String(highContrast));
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, highContrast, setHighContrast, language, setLanguage }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) throw new Error('useAccessibility must be used within an AccessibilityProvider');
  return context;
};
