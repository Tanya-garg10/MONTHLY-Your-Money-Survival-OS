import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-[#141816] border border-[#222925] rounded-xl p-6 shadow-2xl space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                danger ? 'bg-rose-500/10 text-rose-400' : 'bg-[#C7FF4A]/10 text-[#C7FF4A]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 id="confirm-modal-title" className="text-base font-semibold text-zinc-100">
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-[#191E1B] hover:bg-[#222925] border border-[#222925] rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              danger
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-[#C7FF4A] hover:bg-[#b5ee3a] text-black'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
