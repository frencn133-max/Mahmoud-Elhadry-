
import React, { createContext } from 'react';
import { Section, Language, Theme, HistoryItem } from '../types';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  removeFromHistory: (id: number) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = AppContext.Provider;
