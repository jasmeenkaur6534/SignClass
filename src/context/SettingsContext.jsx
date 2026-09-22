import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [captionSize, setCaptionSize] = useState(() => {
    return localStorage.getItem('signclass_caption_size') || '24px';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('signclass_theme') || 'dark'; // dark default
  });

  const [demoMode, setDemoMode] = useState(false); // Default OFF so real Python STT mic pipeline runs by default

  useEffect(() => {
    localStorage.setItem('signclass_caption_size', captionSize);
    document.documentElement.style.setProperty('--caption-size', captionSize);
  }, [captionSize]);

  useEffect(() => {
    localStorage.setItem('signclass_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global hotkey Ctrl+Shift+D to toggle Demo Mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setDemoMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SettingsContext.Provider value={{
      captionSize,
      setCaptionSize,
      theme,
      setTheme,
      demoMode,
      setDemoMode
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
