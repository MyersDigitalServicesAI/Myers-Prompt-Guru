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
        success: 'border-green-100 bg-green-50 shadow-green-100/50',
        error: 'border-red-100 bg-red-50 shadow-red-100/50',
        info: 'border-blue-100 bg-blue-50 shadow-blue-100/50'
    };

    return (
        <div className={`
      fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300
      ${colors[type]}
    `}>
            <div className="flex-shrink-0">{icons[type]}</div>
            <p className="text-sm font-medium text-slate-800 pr-2">{message}</p>
            <button
                onClick={onClose}
                className="p-1 hover:bg-white/50 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
