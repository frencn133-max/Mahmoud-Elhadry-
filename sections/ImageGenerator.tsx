
import React, { useState, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { generateImage } from '../services/geminiService';
import { GeneratedImage } from '../types';
import { ASPECT_RATIOS, IMAGE_MODELS } from '../constants';
import Icon from '../components/Icon';
import Spinner from '../components/Spinner';
import { downloadFile } from '../utils/fileUtils';

const ImageGenerator: React.FC = () => {
    const { t, addToHistory } = useAppContext();
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [model, setModel] = useState(IMAGE_MODELS[0].id);
    const [numImages, setNumImages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt || isLoading) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            const images = await generateImage(prompt, model, aspectRatio, numImages);
            setGeneratedImages(images.map(src => ({
                src,
                prompt,
                model,
                aspectRatio,
            })));
        } catch (err) {
            console.error(err);
            setError(t.imageGenerator.error);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, model, aspectRatio, numImages, isLoading, t]);
    
    const handleSave = useCallback((image: GeneratedImage) => {
        addToHistory({
            type: 'image',
            content: image.src,
            prompt: image.prompt,
        });
    }, [addToHistory]);

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls Panel */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{t.nav.imageGenerator}</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t.imageGenerator.prompt}</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={t.imageGenerator.prompt}
                                className="w-full h-28 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t.imageGenerator.model}</label>
                            <select value={model} onChange={e => setModel(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" disabled={isLoading}>
                                {IMAGE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t.imageGenerator.aspectRatio}</label>
                            <div className="grid grid-cols-3 gap-2">
                                {ASPECT_RATIOS.map(ratio => (
                                    <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`py-2 px-3 rounded-lg text-sm transition ${aspectRatio === ratio ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`} disabled={isLoading}>{ratio}</button>
                                ))}
                            </div>
                        </div>
                        {model.startsWith('imagen') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t.imageGenerator.numImages} ({numImages})</label>
                            <input type="range" min="1" max="4" value={numImages} onChange={e => setNumImages(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" disabled={isLoading}/>
                        </div>
                        )}
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-transform transform active:scale-95 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <><Spinner className="w-5 h-5"/> {t.imageGenerator.generating}</> : <><Icon name="image" className="w-5 h-5"/> {t.imageGenerator.generate}</>}
                        </button>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 min-h-[60vh] flex items-center justify-center">
                    {isLoading && <div className="flex flex-col items-center gap-4"><Spinner className="w-12 h-12" /><p className="text-slate-500">{t.imageGenerator.generating}</p></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isLoading && !error && generatedImages.length === 0 && <p className="text-slate-500 text-center">{t.imageGenerator.prompt}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {generatedImages.map((image, index) => (
                            <div key={index} className="group relative rounded-lg overflow-hidden shadow-lg">
                                <img src={image.src} alt={image.prompt} className="w-full h-full object-cover"/>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => setZoomedImage(image.src)} className="p-2 bg-white/20 rounded-full hover:bg-white/40"><Icon name="zoom" className="w-6 h-6 text-white"/></button>
                                    <button onClick={() => downloadFile(image.src, `mahmoud-elhadry-ai-${Date.now()}.png`)} className="p-2 bg-white/20 rounded-full hover:bg-white/40"><Icon name="download" className="w-6 h-6 text-white"/></button>
                                    <button onClick={() => handleSave(image)} className="p-2 bg-white/20 rounded-full hover:bg-white/40"><Icon name="save" className="w-6 h-6 text-white"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Zoomed Image Modal */}
            {zoomedImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setZoomedImage(null)}>
                    <img src={zoomedImage} alt="Zoomed view" className="max-w-[90vw] max-h-[90vh] object-contain"/>
                </div>
            )}
        </div>
    );
};

export default ImageGenerator;
