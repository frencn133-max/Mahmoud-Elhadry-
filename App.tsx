import React, { useState, useCallback } from 'react';
// Fix: Import types from their source file to resolve module export errors.
import { AppProvider } from './contexts/AppContext';
import type { Section, HistoryItem } from './types';
import Header from './components/Header';
import ImageGenerator from './sections/ImageGenerator';
import ImageEditor from './sections/ImageEditor';
import TextToSpeech from './sections/TextToSpeech';
import ImageToText from './sections/ImageToText';
import AIChat from './sections/AIChat';
import History from './sections/History';
import Settings from './sections/Settings';

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [language, setLanguage] = useState<'en' | 'ar'>('en');
    const [activeSection, setActiveSection] = useState<Section>('image-generator');
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguage(prevLang => (prevLang === 'en' ? 'ar' : 'en'));
    }, []);
    
    const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        setHistory(prev => [{ ...item, id: Date.now(), timestamp: new Date() }, ...prev]);
    }, []);

    const removeFromHistory = useCallback((id: number) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    }, []);

    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        root.lang = language;
        root.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [theme, language]);

    const renderSection = () => {
        switch (activeSection) {
            case 'image-generator': return <ImageGenerator />;
            case 'image-editor': return <ImageEditor />;
            case 'text-to-speech': return <TextToSpeech />;
            case 'image-to-text': return <ImageToText />;
            case 'ai-chat': return <AIChat />;
            case 'history': return <History />;
            case 'settings': return <Settings />;
            default: return <ImageGenerator />;
        }
    };

    return (
        <AppProvider value={{ 
            theme, 
            toggleTheme, 
            language, 
            toggleLanguage, 
            activeSection, 
            setActiveSection, 
            history, 
            addToHistory,
            removeFromHistory
        }}>
            <div className={`min-h-screen font-sans text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 transition-colors duration-300 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                <Header />
                <main className="p-4 sm:p-6 lg:p-8">
                    {renderSection()}
                </main>
            </div>
        </AppProvider>
    );
};

export default App;