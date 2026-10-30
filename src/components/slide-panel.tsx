'use client';
import { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';
export function SlidePanel({
  title,
  label,
  onClose,
  children,
  closeLabel = 'Close panel',
  className = '',
}: {
  title: string;
  label: string;
  onClose: () => void;
  children: React.ReactNode;
  closeLabel?: string;
  className?: string;
}) {
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.showModal();
    return () => {
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`task-modal slide-panel team-panel ${className}`}
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="task-modal-content">
        <header className="slide-panel-header">
          <div>
            <p className="detail-reference">{label}</p>
            <h2 id={id}>{title}</h2>
          </div>
          <button
            type="button"
            className="icon-button modal-close"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
