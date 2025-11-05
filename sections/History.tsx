
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { HistoryItemType } from '../types';
import Icon from '../components/Icon';

const History: React.FC = () => {
    const { t, history, removeFromHistory, setActiveSection } = useAppContext();
    const [activeTab, setActiveTab] = useState<HistoryItemType>('image');

    const filteredHistory = history.filter(item => item.type === activeTab);

    const tabs: { id: HistoryItemType; label: string }[] = [
        { id: 'image', label: t.history.images },
        { id: 'audio', label: t.history.audios },
        { id: 'text', label: t.history.texts },
    ];
    
    const TabButton: React.FC<{ id: HistoryItemType, label: string }> = ({ id, label }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeTab === id ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
            {label}
        </button>
    );

    const renderItem = (item: typeof history[0]) => {
        switch(item.type) {
            case 'image':
                return <img src={item.content} alt={item.prompt || 'Generated image'} className="w-full h-48 object-cover rounded-t-lg"/>;
            case 'audio':
                return <div className="p-4"><audio controls src={item.content} className="w-full"></audio></div>;
            case 'text':
                return <p className="p-4 text-sm text-slate-600 dark:text-slate-300 max-h-48 overflow-y-auto">{item.content}</p>
        }
    }

    return (
        <div className="container mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold mb-6">{t.history.title}</h2>
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {tabs.map(tab => <TabButton key={tab.id} {...tab} />)}
                </nav>
            </div>
            
            <div className="mt-6">
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-slate-500">{t.history.noItems}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredHistory.map(item => (
                            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
                                <div className="flex-grow">{renderItem(item)}</div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700">
                                    {item.prompt && <p className="text-xs text-slate-500 truncate mb-2" title={item.prompt}>{item.prompt}</p>}
                                    <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => removeFromHistory(item.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                                            <Icon name="trash" className="w-4 h-4 text-red-500"/>
                                        </button>
                                        {/* {item.prompt && <button className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50"><Icon name="reset" className="w-4 h-4 text-indigo-500"/></button>} */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
