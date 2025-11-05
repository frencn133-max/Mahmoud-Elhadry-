
import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { translations } from '../constants';

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  const t = translations[context.language];
  return { ...context, t };
};
