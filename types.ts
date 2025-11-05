
export type Section = 
  'image-generator' | 
  'image-editor' | 
  'text-to-speech' | 
  'image-to-text' | 
  'ai-chat' | 
  'history' | 
  'settings';

export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export interface GeneratedImage {
  src: string;
  prompt: string;
  model: string;
  aspectRatio: string;
}

export type HistoryItemType = 'image' | 'audio' | 'text';

export interface HistoryItem {
  id: number;
  type: HistoryItemType;
  content: string; // URL for image/audio, text content for OCR
  prompt?: string; // For images and audio
  timestamp: Date;
}
