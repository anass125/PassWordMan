import { useEffect } from 'react';

// type: 'success' | 'error' | 'info'
export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: 'border-[#00C9A7] text-[#00C9A7] bg-[#00C9A720]',
    error:   'border-[#FF4D6D] text-[#FF4D6D] bg-[#FF4D6D20]',
    info:    'border-[#252A3A] text-[#7A8099] bg-[#141720]',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium animate-fadeIn ${styles[type]}`}>
      {type === 'success' && <span>✓</span>}
      {type === 'error'   && <span>✕</span>}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-xs">✕</button>
    </div>
  );
}
