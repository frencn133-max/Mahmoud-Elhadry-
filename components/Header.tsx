
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { SECTIONS } from '../constants';
import Icon from './Icon';

const Header: React.FC = () => {
    const { activeSection, setActiveSection, language, toggleLanguage, theme, toggleTheme, t } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const NavLink: React.FC<{ sectionId: typeof SECTIONS[0]['id']; iconName: string }> = ({ sectionId, iconName }) => {
        const label = t.nav[SECTIONS.find(s => s.id === sectionId)!.labelKey];
        const isActive = activeSection === sectionId;
        return (
            <button
                onClick={() => { setActiveSection(sectionId); setIsMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-indigo-500 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
                <Icon name={iconName} className="w-5 h-5" />
                <span>{label}</span>
            </button>
        );
    };

    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-md dark:shadow-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Icon name="logo" className="w-8 h-8 text-indigo-500" />
                        <span className="text-xl font-bold text-slate-800 dark:text-white">{t.appName}</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-2">
                        {SECTIONS.map(section => (
                             <NavLink key={section.id} sectionId={section.id} iconName={section.id.split('-')[0]} />
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <Icon name="language" className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            {theme === 'dark' ? <Icon name="sun" className="w-6 h-6 text-yellow-400" /> : <Icon name="moon" className="w-6 h-6 text-slate-700" />}
                        </button>
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {SECTIONS.map(section => (
                         <NavLink key={section.id} sectionId={section.id} iconName={section.id.split('-')[0]} />
                    ))}
                </div>
            )}
        </header>
    );
};

export default Header;
