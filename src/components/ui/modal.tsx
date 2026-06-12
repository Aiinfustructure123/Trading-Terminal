"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/primitives";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[8vh]" onClick={onClose}>
      <div className={cn("glass animate-panel-in w-full max-w-lg rounded-xl shadow-2xl", className)} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        {title && (
          <div className="flex items-center justify-between border-b border-border-strong px-4 py-3">
            <Eyebrow>{title}</Eyebrow>
            <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
