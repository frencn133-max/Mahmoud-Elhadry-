import React, { useState, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { textToSpeech } from '../services/geminiService';
import { ALL_TTS_VOICES } from '../constants';
import Icon from '../components/Icon';
import Spinner from '../components/Spinner';
import { downloadFile } from '../utils/fileUtils';

const TextToSpeech: React.FC = () => {
    const { t, addToHistory } = useAppContext();
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState(ALL_TTS_VOICES[0].id);
    const [voiceStyle, setVoiceStyle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!text || isLoading) return;
        setIsLoading(true);
        setError(null);
        setAudioUrl(null);
        
        const fullPrompt = voiceStyle ? `Say with a ${voiceStyle} tone: ${text}` : text;

        try {
            const url = await textToSpeech(fullPrompt, selectedVoice);
            setAudioUrl(url);
            addToHistory({ type: 'audio', content: url, prompt: text });
        } catch (err) {
            console.error(err);
            setError(t.textToSpeech.error);
        } finally {
            setIsLoading(false);
        }
    }, [text, selectedVoice, voiceStyle, isLoading, t, addToHistory]);

    return (
        <div className="container mx-auto max-w-4xl">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{t.nav.textToSpeech}</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t.textToSpeech.enterText}</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={t.textToSpeech.enterText}
                            className="w-full h-36 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t.textToSpeech.voice}</label>
                            <select 
                                value={selectedVoice} 
                                onChange={e => setSelectedVoice(e.target.value)} 
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                                disabled={isLoading}
                            >
                                {ALL_TTS_VOICES.map(voice => <option key={voice.id} value={voice.id}>{t.textToSpeech.voices[voice.nameKey]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t.textToSpeech.voiceStyle}</label>
                            <input
                                type="text"
                                value={voiceStyle}
                                onChange={(e) => setVoiceStyle(e.target.value)}
                                placeholder="e.g., cheerful, professional"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !text}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-transform transform active:scale-95 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <><Spinner className="w-5 h-5"/> {t.textToSpeech.generating}</> : <><Icon name="tts" className="w-5 h-5"/> {t.textToSpeech.generateAudio}</>}
                    </button>

                    {error && <p className="text-red-500 text-center">{error}</p>}

                    {audioUrl && (
                        <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <h3 className="font-bold mb-2">{t.textToSpeech.lastRecording}</h3>
                            <audio controls src={audioUrl} className="w-full">
                                Your browser does not support the audio element.
                            </audio>
                            <button
                                onClick={() => downloadFile(audioUrl, `mahmoud-elhadry-tts-${Date.now()}.mp3`)}
                                className="mt-2 w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition"
                            >
                                <Icon name="download" className="w-5 h-5"/> {t.textToSpeech.downloadAudio}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TextToSpeech;