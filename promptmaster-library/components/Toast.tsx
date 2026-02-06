import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const colors = {
        success: 'border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/10',
        error: 'border-red-500/20 bg-red-500/10 shadow-red-500/10',
        info: 'border-blue-500/20 bg-blue-500/10 shadow-blue-500/10'
    };

    return (
        <div className={`
      fixed bottom-8 right-8 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl glass border shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 cubic-bezier(0.16, 1, 0.3, 1)
      ${colors[type]}
    `}>
            <div className="flex-shrink-0 animate-pulse">{icons[type]}</div>
            <p className="text-sm font-black text-white pr-4 tracking-tight">{message}</p>
            <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-500 hover:text-white"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
