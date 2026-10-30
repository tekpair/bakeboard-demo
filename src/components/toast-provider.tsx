'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react';

type ToastKind = 'success' | 'error' | 'warning' | 'info';
type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
  exiting?: boolean;
};
type ToastApi = { showToast: (kind: ToastKind, message: string) => void };

const ToastContext = createContext<ToastApi | null>(null);
const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};
const durations: Record<ToastKind, number | null> = {
  success: 4000,
  error: null,
  warning: 8000,
  info: 6000,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const exitTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    if (exitTimers.current.has(id)) return;
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id ? { ...toast, exiting: true } : toast,
      ),
    );
    exitTimers.current.set(
      id,
      setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        exitTimers.current.delete(id);
      }, 220),
    );
  }, []);

  const showToast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++nextId.current;
      setToasts((current) => [...current, { id, kind, message }]);
      const duration = durations[kind];
      if (duration)
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
    },
    [dismiss],
  );

  useEffect(() => {
    const activeTimers = timers.current;
    const activeExitTimers = exitTimers.current;
    return () => {
      activeTimers.forEach(clearTimeout);
      activeExitTimers.forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" aria-label="Notifications">
        {toasts.map(({ id, kind, message, exiting }) => {
          const Icon = icons[kind];
          return (
            <div
              key={id}
              className={`app-toast app-toast-${kind}${exiting ? ' app-toast-exiting' : ''}`}
              role={kind === 'error' || kind === 'warning' ? 'alert' : 'status'}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{message}</span>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(id)}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context.showToast;
}

export function useOptionalToast() {
  return useContext(ToastContext)?.showToast;
}
