import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { id, type, title, message, duration = 5000 } = toast;

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-gaming-status-enabled" />;
      case "error":
        return <XCircle size={20} className="text-gaming-status-conflict" />;
      case "warning":
        return <AlertCircle size={20} className="text-gaming-accent-magenta" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-gaming-status-enabled/10 border-gaming-status-enabled/30 shadow-glow";
      case "error":
        return "bg-gaming-status-conflict/10 border-gaming-status-conflict/30 shadow-glow";
      case "warning":
        return "bg-gaming-accent-magenta/10 border-gaming-accent-magenta/30 shadow-glow";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={`glass-panel rounded-2xl p-4 border ${getStyles()} min-w-[320px] max-w-[400px]`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gaming-text-primary text-sm mb-1">
            {title}
          </h4>
          {message && (
            <p className="text-gaming-text-secondary text-xs leading-relaxed">
              {message}
            </p>
          )}
        </div>
        <motion.button
          onClick={() => onDismiss(id)}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-gaming-bg-overlay/50 text-gaming-text-muted hover:text-gaming-text-primary transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div className="fixed top-20 right-4 z-[99999] space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

type ToastOptions = {
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
};

// Toast hook for easy usage
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = React.useCallback(
    (titleOrOptions: string | ToastOptions, message?: string) => {
      if (typeof titleOrOptions === "string") {
        addToast({ type: "success", title: titleOrOptions, message });
      } else {
        addToast({ type: "success", ...titleOrOptions });
      }
    },
    [addToast]
  );

  const error = React.useCallback(
    (titleOrOptions: string | ToastOptions, message?: string) => {
      if (typeof titleOrOptions === "string") {
        addToast({ type: "error", title: titleOrOptions, message });
      } else {
        addToast({ type: "error", ...titleOrOptions });
      }
    },
    [addToast]
  );

  const warning = React.useCallback(
    (titleOrOptions: string | ToastOptions, message?: string) => {
      if (typeof titleOrOptions === "string") {
        addToast({ type: "warning", title: titleOrOptions, message });
      } else {
        addToast({ type: "warning", ...titleOrOptions });
      }
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
  };
};
