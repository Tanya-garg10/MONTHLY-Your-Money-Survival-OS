import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useFinance();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-[#C7FF4A] shrink-0" />;
        let borderClass = 'border-[#C7FF4A]/30 bg-[#141816]/95';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
          borderClass = 'border-rose-500/30 bg-[#141816]/95 text-rose-100';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
          borderClass = 'border-amber-500/30 bg-[#141816]/95 text-amber-100';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-sky-400 shrink-0" />;
          borderClass = 'border-sky-500/30 bg-[#141816]/95 text-sky-100';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-xl text-xs sm:text-sm font-medium transition-all ${borderClass}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="text-zinc-200">{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
