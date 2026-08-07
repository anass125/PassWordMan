import { useState } from 'react';

export default function PasswordCard({ entry, onEdit, onDelete }) {
  const [revealed,  setRevealed]  = useState(false);
  const [copied,    setCopied]    = useState('');   // which field was just copied

  const copyToClipboard = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(''), 1800);
    } catch {
      // Clipboard API unavailable in non-HTTPS — silent fail
    }
  };

  // Derive a short domain label for the icon fallback
  const domainInitial = entry.site?.[0]?.toUpperCase() || '?';

  return (
    <div className="group bg-[#141720] border border-[#252A3A] hover:border-[#00C9A740] rounded-xl px-5 py-4 transition-colors animate-fadeIn">

      <div className="flex items-start justify-between gap-4">

        {/* Left: icon + site + username */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon placeholder */}
          <div className="shrink-0 w-9 h-9 rounded-lg bg-[#1C2030] border border-[#252A3A] flex items-center justify-center font-mono text-[#00C9A7] font-bold text-sm">
            {domainInitial}
          </div>
          <div className="min-w-0">
            <p className="text-[#E8EAF0] font-medium text-sm truncate">{entry.site}</p>
            <button
              onClick={() => copyToClipboard(entry.username, 'username')}
              className="text-[#7A8099] text-xs hover:text-[#00C9A7] transition-colors truncate max-w-[180px] block"
              title="Copy username"
            >
              {copied === 'username' ? '✓ Copied!' : entry.username}
            </button>
          </div>
        </div>

        {/* Right: password + actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Password value */}
          <span
            className={`font-mono text-sm text-[#7A8099] select-none ${revealed ? '' : 'password-blur'}`}
            style={{ letterSpacing: revealed ? 'normal' : '0.05em' }}
          >
            {entry.password}
          </span>

          {/* Reveal toggle */}
          <button
            onClick={() => setRevealed((v) => !v)}
            className="text-[#4A5068] hover:text-[#7A8099] transition-colors text-xs px-1.5"
            title={revealed ? 'Hide' : 'Reveal'}
          >
            {revealed ? '●' : '○'}
          </button>

          {/* Copy password */}
          <button
            onClick={() => copyToClipboard(entry.password, 'password')}
            className="text-[#4A5068] hover:text-[#00C9A7] transition-colors text-xs px-1.5"
            title="Copy password"
          >
            {copied === 'password' ? '✓' : '⎘'}
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(entry)}
            className="text-[#4A5068] hover:text-[#7A8099] transition-colors text-xs px-1.5 opacity-0 group-hover:opacity-100"
            title="Edit"
          >
            ✎
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(entry._id)}
            className="text-[#4A5068] hover:text-[#FF4D6D] transition-colors text-xs px-1.5 opacity-0 group-hover:opacity-100"
            title="Delete"
          >
            ✕
          </button>

        </div>
      </div>

      {/* Notes row (if present) */}
      {entry.notes && (
        <p className="mt-2 ml-12 text-xs text-[#4A5068] truncate">{entry.notes}</p>
      )}

    </div>
  );
}
