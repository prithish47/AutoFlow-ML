import { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

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
            className="fixed z-[9999] min-w-[160px] py-1 bg-white border border-black/5 rounded-xl shadow-2xl overflow-hidden"
            style={{ left: x, top: y }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                    onClose?.();
                }}
                className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-[#dc2626] hover:bg-[#dc2626] hover:text-white transition-all flex items-center justify-between group"
            >
                <span>Delete Edge</span>
                <Trash2 size={14} />
            </button>
        </div>
    );
}
