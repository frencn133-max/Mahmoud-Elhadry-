import React, { useState, useRef, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Icon from '../components/Icon';
import Spinner from '../components/Spinner';
import { fileToBase64, downloadFile } from '../utils/fileUtils';
import { editImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
    const { t, addToHistory } = useAppContext();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) return;
        setIsLoading(true);
        const { base64, mimeType } = await fileToBase64(file);
        const dataUrl = `data:${mimeType};base64,${base64}`;
        setOriginalImage(dataUrl);
        setCurrentImage(dataUrl);
        setPrompt('');
        setError(null);
        setIsLoading(false);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };
    
    const handleReset = () => {
        setCurrentImage(originalImage);
        setPrompt('');
        setError(null);
    }

    const handleApplyEdit = async () => {
        if (!currentImage || !prompt) return;
        setIsLoading(true);
        setError(null);
        try {
            const base64 = currentImage.split(',')[1];
            const mimeType = currentImage.split(',')[0].split(':')[1].split(';')[0];
            const result = await editImage(base64, mimeType, prompt);
            setCurrentImage(result);
        } catch(e) {
            console.error(e);
            setError(t.imageEditor.error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (currentImage) {
            downloadFile(currentImage, `edited-image-${Date.now()}.png`);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                
                {!currentImage && !isLoading && (
                    <div className="text-center p-8">
                        <Icon name="upload" className="mx-auto h-12 w-12 text-slate-400" />
                        <h2 className="mt-4 text-2xl font-bold">{t.imageEditor.uploadTitle}</h2>
                        <button onClick={() => fileInputRef.current?.click()} className="mt-6 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition">
                            {t.imageEditor.uploadButton}
                        </button>
                        <p className="mt-2 text-slate-500">{t.imageEditor.dragDrop}</p>
                    </div>
                )}

                {isLoading && !currentImage && <Spinner className="w-12 h-12 m-12" />}

                {currentImage && (
                    <div className="w-full">
                        <div className="relative mb-4 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center min-h-[40vh]">
                            <img src={currentImage} alt="Editable preview" className="max-w-full max-h-[70vh] object-contain" />
                             {isLoading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Spinner className="w-12 h-12"/></div>}
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t.imageEditor.editPrompt}</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={t.imageEditor.editPrompt}
                                    className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    disabled={isLoading}
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <button onClick={handleApplyEdit} disabled={isLoading || !prompt} className="col-span-2 md:col-span-2 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400">
                                    <Icon name="edit" className="w-5 h-5"/> {t.imageEditor.apply}
                                </button>
                                <button onClick={handleReset} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-600 font-medium py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition">
                                    <Icon name="reset" className="w-5 h-5"/> {t.imageEditor.reset}
                                </button>
                                <button onClick={handleDownload} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-600 transition">
                                    <Icon name="download" className="w-5 h-5"/> {t.imageEditor.save}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageEditor;