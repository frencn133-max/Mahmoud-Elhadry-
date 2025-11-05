import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { startChat, streamMessageToChat } from '../services/geminiService';
import Icon from '../components/Icon';
import Spinner from '../components/Spinner';

// Note: SpeechRecognition is not supported in all browsers
// Fix: Cast window to `any` to access experimental browser APIs without TypeScript errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const AIChat: React.FC = () => {
    const { t, language } = useAppContext();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        startChat(); // Initialize chat session on component mount
        setMessages([{sender: 'ai', text: 'Hello! How can I help you today?'}]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isThinking) return;
        
        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsThinking(true);
        
        setMessages(prev => [...prev, { sender: 'ai', text: '' }]);

        try {
            const stream = await streamMessageToChat(input);
            for await (const chunk of stream) {
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.sender === 'ai') {
                        lastMessage.text += chunk.text;
                        return [...prev.slice(0, -1), lastMessage];
                    }
                    return prev;
                });
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error.' }]);
        } finally {
            setIsThinking(false);
        }
    }, [input, isThinking]);
    
    useEffect(() => {
        if (!recognition) return;
        recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
        recognition.onresult = (event: any) => {
            setInput(event.results[0][0].transcript);
        };
        recognition.onend = () => {
            setIsListening(false);
        };
    }, [language]);
    
    const toggleListen = () => {
        if (isListening) {
            recognition?.stop();
        } else {
            recognition?.start();
        }
        setIsListening(!isListening);
    };


    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            {/* Message Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-lg p-3 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isThinking && messages[messages.length-1].sender === 'user' && (
                         <div className="flex justify-start">
                             <div className="max-w-lg p-3 rounded-lg bg-slate-200 dark:bg-slate-700">
                                <Spinner className="w-5 h-5" />
                            </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            
            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isListening ? t.aiChat.listening : t.aiChat.sendMessage}
                        className="flex-1 p-3 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isThinking}
                    />
                    {recognition && (
                        <button onClick={toggleListen} className={`p-3 rounded-lg ${isListening ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-600'} text-white`}>
                            <Icon name={isListening ? 'stop' : 'mic'} className={`w-6 h-6 ${isListening ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`} />
                        </button>
                    )}
                    <button onClick={handleSend} disabled={!input || isThinking} className="bg-indigo-600 text-white font-bold p-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChat;