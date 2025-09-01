import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-gaming-bg-surface/90 backdrop-blur-lg rounded-2xl border border-gaming-border/50 p-6 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-gaming-text-muted hover:text-gaming-text hover:bg-gaming-bg-overlay/50 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gaming-text">{title}</h3>
            <p className="text-gaming-text-muted">{message}</p>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gaming-bg-overlay/50 text-gaming-text hover:bg-gaming-bg-overlay transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gaming-status-error/90 text-white hover:bg-gaming-status-error transition-colors shadow-lg hover:shadow-gaming-status-error/20"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
