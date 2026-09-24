import React from 'react';
import { useShop } from '../../context/ShopContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl text-white backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'error'
              ? 'bg-red-600/95 border border-red-400/30'
              : toast.type === 'info'
              ? 'bg-sky-600/95 border border-sky-400/30'
              : 'bg-emerald-600/95 border border-emerald-400/30'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-100" />}
            {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0 text-sky-100" />}
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-100" />}
            <span className="text-sm font-medium tracking-wide">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 text-white/80 hover:text-white rounded-lg transition-colors ml-2"
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
