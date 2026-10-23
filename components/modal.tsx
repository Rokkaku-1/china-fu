"use client";
import { useEffect, useRef } from "react";
export default function Modal({
  open,
  onClose,
  title,
  id,
  children,
  drawer = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  id: string;
  children: React.ReactNode;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (open && !d?.open) d?.showModal();
    if (!open && d?.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      id={drawer ? "cart" : id}
      aria-labelledby={`${id}-title`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (open) onClose();
      }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          onClose();
      }}
    >
      <button
        className="close"
        aria-label={`Cerrar ${title}`}
        onClick={onClose}
      >
        ×
      </button>
      <span className="eyebrow">CHINA FU</span>
      <h2 id={`${id}-title`}>{title}</h2>
      {children}
    </dialog>
  );
}
