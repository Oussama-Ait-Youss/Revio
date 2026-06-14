import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * PortalModal
 * Renders a modal at the root document.body level to avoid layout interference
 * from CSS transforms, ensuring perfect viewport centering.
 */
export default function PortalModal({ title, onClose, children, icon: Icon }) {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return createPortal(
        <div className="modal-backdrop" onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="flex items-center gap-2">
                        {Icon && <Icon className="text-primary" />}
                        {title}
                    </h2>
                    <button 
                        className="icon-action" 
                        type="button" 
                        onClick={onClose} 
                        aria-label="Close" 
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
}
