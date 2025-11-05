
import React, { useState, useCallback, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { imageToText, translateText } from '../services/geminiService';
import { fileToBase64, downloadText } from '../utils/fileUtils';
import Icon from '../components/Icon';
import Spinner from '../components/Spinner';

const ImageToText: React.FC = () => {
    const { t, language, addToHistory } = useAppContext();
    const [image, setImage] = useState<{ url: string; file: File } | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        setImage({ url, file });
        setExtractedText('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };

    const handleConvert = useCallback(async () => {
        if (!image || isLoading) return;
        setIsLoading(true);
        setError(null);

        try {
            const { base64, mimeType } = await fileToBase64(image.file);
            const text = await imageToText(base64, mimeType);
            setExtractedText(text);
        } catch (err) {
            console.error(err);
            setError(t.imageToText.error);
        } finally {
            setIsLoading(false);
        }
    }, [image, isLoading, t]);
    
    const handleTranslate = async () => {
        if(!extractedText) return;
        setIsLoading(true);
        try {
            const targetLang = language === 'en' ? 'Arabic' : 'English';
            const translated = await translateText(extractedText, targetLang);
            setExtractedText(translated);
        } catch(e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }
    
    const handleCopy = () => {
        navigator.clipboard.writeText(extractedText);
    };

    return (
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Upload */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center min-h-[50vh]">
                    {image ? (
                        <img src={image.url} alt="Uploaded preview" className="max-w-full max-h-96 object-contain rounded-lg"/>
                    ) : (
                        <div className="text-center">
                            <Icon name="upload" className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-2 text-lg font-medium">{t.imageToText.uploadTitle}</h3>
                            <p className="mt-1 text-sm text-slate-500">{t.imageToText.dragDrop}</p>
                            <button onClick={() => fileInputRef.current?.click()} className="mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
                                {t.imageToText.uploadButton}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                    )}
                    {image && (
                         <button
                            onClick={handleConvert}
                            disabled={isLoading || !image}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                        >
                            {isLoading ? <><Spinner className="w-5 h-5"/>{t.imageToText.converting}</> : <><Icon name="ocr" className="w-5 h-5"/>{t.imageToText.convertToText}</>}
                        </button>
                    )}
                </div>

                {/* Extracted Text */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">{t.imageToText.extractedText}</h3>
                    <div className="relative">
                        <textarea
                            readOnly
                            value={extractedText}
                            className="w-full h-96 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg"
                            placeholder={isLoading ? '' : '...'}
                        />
                        {isLoading && !extractedText && <div className="absolute inset-0 flex items-center justify-center"><Spinner /></div>}
                    </div>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    {extractedText && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                             <button onClick={handleCopy} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition text-sm"><Icon name="copy" className="w-4 h-4"/>{t.imageToText.copy}</button>
                             <button onClick={() => downloadText(extractedText, 'extracted-text.txt')} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition text-sm"><Icon name="download" className="w-4 h-4"/>{t.imageToText.downloadTxt}</button>
                             <button onClick={handleTranslate} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition text-sm"><Icon name="language" className="w-4 h-4"/>{t.imageToText.translate}</button>
                             <button onClick={() => addToHistory({type: 'text', content: extractedText})} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition text-sm"><Icon name="save" className="w-4 h-4"/>{t.imageToText.save}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageToText;
