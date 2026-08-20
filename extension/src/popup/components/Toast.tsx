import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-light-success dark:text-dark-success shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-light-danger dark:text-dark-danger shrink-0" />,
    info: <Info className="w-4 h-4 text-light-accent dark:text-dark-accent shrink-0" />,
  };

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 flex flex-col items-center pointer-events-none gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            onClick={() => onDismiss(toast.id)}
            className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-gray-900/95 dark:bg-gray-800/95 text-white text-xs font-medium rounded-lg shadow-lg border border-white/10 cursor-pointer backdrop-blur-sm max-w-[380px]"
          >
            {iconMap[toast.type]}
            <span className="truncate">{toast.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
