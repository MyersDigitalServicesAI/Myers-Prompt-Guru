import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Sparkles, Loader2, CheckCircle, AlertCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { extractPromptsFromText, extractPromptsFromImage, ExtractedPrompt } from '../services/gemini';
import { Category } from '../types';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (prompts: ExtractedPrompt[]) => void;
}

export const BulkAddModal: React.FC<BulkAddModalProps> = ({ isOpen, onClose, onImport }) => {
  const [step, setStep] = useState<'input' | 'processing' | 'review'>('input');
  const [text, setText] = useState('');
  const [extracted, setExtracted] = useState<ExtractedPrompt[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Image handling
  const [selectedImage, setSelectedImage] = useState<{ url: string; base64: string; mimeType: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      handleCloseState();
    }
  }, [isOpen]);

  // Handle Paste Event for Images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen || step !== 'input') return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) processImageFile(blob);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, step]);

  const processImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size too large. Please use an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // result looks like "data:image/png;base64,..."
      const [prefix, base64] = result.split(',');
      const mimeType = prefix.match(/:(.*?);/)?.[1] || 'image/png';
      
      setSelectedImage({
        url: result,
        base64: base64,
        mimeType: mimeType
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      processImageFile(file);
    } else {
      // Text file
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(prev => prev + (prev ? '\n\n' : '') + content);
      };
      reader.readAsText(file);
    }
    // Reset inputs
    e.target.value = '';
  };

  const processContent = async () => {
    if (!text.trim() && !selectedImage) return;
    
    setStep('processing');
    setError(null);

    try {
      let result: ExtractedPrompt[] = [];

      if (selectedImage) {
        result = await extractPromptsFromImage(selectedImage.base64, selectedImage.mimeType);
      } else {
        result = await extractPromptsFromText(text);
      }

      if (result.length === 0) {
        setError("No prompts could be identified. Try clearer text or a sharper image.");
        setStep('input');
      } else {
        setExtracted(result);
        setStep('review');
      }
    } catch (err) {
      setError("AI Service unavailable. Please check your API key or try again later.");
      setStep('input');
    }
  };

  const handleFinalImport = () => {
    onImport(extracted);
    handleCloseState();
    onClose();
  };

  const handleCloseState = () => {
    setText('');
    setSelectedImage(null);
    setExtracted([]);
    setStep('input');
    setError(null);
  };

  const closeModal = () => {
    handleCloseState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Bulk Import</h2>
              <p className="text-sm text-slate-500">Extract from Text, Photos, or Screenshots</p>
            </div>
          </div>
          <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 'input' && (
            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <div className="relative">
                {selectedImage ? (
                  <div className="w-full h-64 bg-slate-900 rounded-xl relative flex items-center justify-center overflow-hidden border border-slate-200">
                    <img 
                      src={selectedImage.url} 
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain"
                    />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                      Image Mode
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your text or drop an image here...
                    
Supported:
- Text content
- Screenshots (Ctrl+V)
- Photos of handwritten notes"
                    className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                  />
                )}
                
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <input 
                    type="file" 
                    ref={imageInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept=".txt,.md,.csv,.json"
                    onChange={handleFileUpload}
                  />
                  
                  {!selectedImage && (
                    <>
                      <button 
                        onClick={() => imageInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-medium text-slate-600 hover:text-purple-600 hover:border-purple-200 transition-colors"
                      >
                        <Camera className="w-3 h-3" />
                        <span className="hidden sm:inline">Photo/Screenshot</span>
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-medium text-slate-600 hover:text-purple-600 hover:border-purple-200 transition-colors"
                      >
                        <Upload className="w-3 h-3" />
                        <span className="hidden sm:inline">Text File</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-slate-400 text-center">
                Tip: You can paste screenshots (Ctrl+V) directly into the box.
              </p>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900">Analyzing Content</h3>
                <p className="text-slate-500 text-sm">
                  {selectedImage ? "Scanning image for text & context..." : "Identifying prompts & categorizing..."}
                </p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">Found {extracted.length} Prompts</h3>
              </div>
              
              <div className="grid gap-3">
                {extracted.map((item, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                          {item.category}
                        </span>
                        <h4 className="font-medium text-slate-900 truncate">{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
          <button 
            onClick={closeModal}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          {step === 'input' && (
            <button 
              onClick={processContent}
              disabled={!text.trim() && !selectedImage}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Analyze
            </button>
          )}

          {step === 'review' && (
            <button 
              onClick={handleFinalImport}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Import {extracted.length} Prompts
            </button>
          )}
        </div>
      </div>
    </div>
  );
};