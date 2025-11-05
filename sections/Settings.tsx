
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const Settings: React.FC = () => {
    const { t, language, toggleLanguage, theme, toggleTheme } = useAppContext();

    return (
        <div className="container mx-auto max-w-2xl">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{t.settings.title}</h2>
                
                <div className="space-y-6">
                    {/* Language Setting */}
                    <div>
                        <label className="block text-lg font-medium text-slate-700 dark:text-slate-200">{t.settings.language}</label>
                        <div className="mt-2 flex rounded-md shadow-sm">
                            <button
                                onClick={() => language !== 'en' && toggleLanguage()}
                                className={`flex-1 px-4 py-2 rounded-l-md text-sm transition ${language === 'en' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => language !== 'ar' && toggleLanguage()}
                                className={`flex-1 px-4 py-2 rounded-r-md text-sm transition ${language === 'ar' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}
                            >
                                العربية
                            </button>
                        </div>
                    </div>

                    {/* Theme Setting */}
                    <div>
                        <label className="block text-lg font-medium text-slate-700 dark:text-slate-200">{t.settings.theme}</label>
                         <div className="mt-2 flex rounded-md shadow-sm">
                            <button
                                onClick={() => theme !== 'light' && toggleTheme()}
                                className={`flex-1 px-4 py-2 rounded-l-md text-sm transition flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}
                            >
                                {t.settings.light}
                            </button>
                            <button
                                onClick={() => theme !== 'dark' && toggleTheme()}
                                className={`flex-1 px-4 py-2 rounded-r-md text-sm transition flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}
                            >
                                {t.settings.dark}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
