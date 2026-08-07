import { useEffect } from 'react';

export default function Modal({ title, onClose, children }) {
  // Close on Escape key
  useEffect(() => {
    const handle = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#141720] border border-[#252A3A] rounded-xl w-full max-w-md mx-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252A3A]">
          <h2 className="text-[#E8EAF0] font-semibold text-base">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#4A5068] hover:text-[#E8EAF0] transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
