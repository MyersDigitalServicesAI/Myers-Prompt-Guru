import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Sparkles, Loader2, CheckCircle, AlertCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { extractPromptsFromText, extractPromptsFromImage, ExtractedPrompt } from '../services/gemini';
import { Category } from '../types';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (prompts: ExtractedPrompt[]) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const BulkAddModal: React.FC<BulkAddModalProps> = ({ isOpen, onClose, onImport, onShowToast }) => {
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
        onShowToast("Extraction failed: No prompts found.", 'error');
      } else {
        setExtracted(result);
        setStep('review');
        onShowToast(`Successfully extracted ${result.length} prompts!`, 'success');
      }
    } catch (err) {
      setError("AI Service unavailable. Please check your API key or try again later.");
      setStep('input');
      onShowToast("Extraction failed: AI Service Error.", 'error');
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeModal} />

      <div className="relative w-full max-w-2xl glass rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/10">

        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-500/5">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">AI Constructor</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Multi-Modal Import Engine</p>
            </div>
          </div>
          <button onClick={closeModal} className="p-3 text-slate-500 hover:bg-white/5 hover:text-white rounded-2xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          {step === 'input' && (
            <div className="space-y-6">
              {error && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <div className="relative">
                {selectedImage ? (
                  <div className="w-full h-80 bg-black/40 rounded-[2rem] relative flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                    <img
                      src={selectedImage.url}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-xl hover:bg-red-500 transition-all backdrop-blur-md shadow-2xl"
                      title="Remove Image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl">
                      Image Context Active
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste architectural text or drop screenshots here...
                    
Supported:
- Raw prompt descriptions
- Screenshots (Ctrl+V)
- Handwritten engineering notes"
                    className="w-full h-80 p-6 bg-white/5 border border-white/10 rounded-[2rem] text-sm font-medium text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 outline-none resize-none placeholder-slate-600 shadow-inner leading-relaxed"
                  />
                )}

                <div className="absolute bottom-6 right-6 flex gap-3">
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
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 shadow-xl rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all backdrop-blur-md"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="hidden sm:inline">Camera/OCR</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 shadow-xl rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all backdrop-blur-md"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">File System</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[10px] font-black text-slate-600 text-center uppercase tracking-widest">
                Ctrl+V to inject screenshots directly for instant OCR mapping.
              </p>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-white tracking-tight">Neural Mapping...</h3>
                <p className="text-slate-500 text-sm font-medium">
                  {selectedImage ? "Deciphering visual prompt architecture..." : "Parsing structure & metadata..."}
                </p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-white text-lg tracking-tight">Discovered {extracted.length} Units</h3>
              </div>

              <div className="grid gap-4">
                {extracted.map((item, idx) => (
                  <div key={idx} className="p-5 glass border border-white/5 rounded-2xl flex gap-4 hover:border-white/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-white truncate text-base">{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-black/20 border-t border-white/5 flex justify-end gap-4">
          <button
            onClick={closeModal}
            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
          >
            Cancel
          </button>

          {step === 'input' && (
            <button
              onClick={processContent}
              disabled={!text.trim() && !selectedImage}
              className="px-8 py-3 btn-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl disabled:opacity-30 disabled:grayscale transition-all shadow-2xl active:scale-95 flex items-center gap-3"
            >
              <Sparkles className="w-4 h-4" />
              Analyze Strategy
            </button>
          )}

          {step === 'review' && (
            <button
              onClick={handleFinalImport}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 flex items-center gap-3"
            >
              <CheckCircle className="w-4 h-4" />
              Deploy {extracted.length} Units
            </button>
          )}
        </div>
      </div>
    </div>
  );
};