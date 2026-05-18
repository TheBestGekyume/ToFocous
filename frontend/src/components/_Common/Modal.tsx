import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  scrollable?: boolean;
  className?: string;
  bodyClassName?: string;
};

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  scrollable = false,
  className = "",
  bodyClassName = "",
}: ModalProps) => {
  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-10 backdrop-blur-xs"
      onMouseDown={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={`
    w-full ${sizeClasses[size]}
    rounded-2xl border border-secondary/20 bg-background-header shadow-2xl
    ${scrollable ? "overflow-hidden" : "overflow-visible"}
    ${className}
  `}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {(title || subtitle || showCloseButton) && (
          <header className="flex items-start justify-between gap-4 border-b border-secondary/20 p-5">
            <div>
              {title && (
                <h2 className="text-2xl font-bold text-primary">{title}</h2>
              )}

              {subtitle && (
                <p className="mt-1 text-sm text-text/70">{subtitle}</p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-background-body p-2 text-text/70 transition hover:text-text"
                title="Fechar"
              >
                <X size={18} />
              </button>
            )}
          </header>
        )}

        <div
          className={`
            p-5
            ${scrollable ? "max-h-[70vh] overflow-y-auto" : "overflow-visible"}
            ${bodyClassName}
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
