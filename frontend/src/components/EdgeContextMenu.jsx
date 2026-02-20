import { useEffect, useRef } from 'react';

export default function EdgeContextMenu({ x, y, onDelete, onClose }) {
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = () => onClose?.();
        const handleKeyDown = (e) => e.key === 'Escape' && onClose?.();
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="fixed z-[9999] min-w-[140px] py-1 bg-white border border-zinc-200 rounded-lg shadow-xl"
            style={{ left: x, top: y }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                    onClose?.();
                }}
                className="w-full text-left px-3 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Delete Edge
            </button>
        </div>
    );
}
