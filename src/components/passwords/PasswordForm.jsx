import { useState } from 'react';

const EMPTY = { site: '', username: '', password: '', notes: '' };

export default function PasswordForm({ initial = EMPTY, onSubmit, onCancel, loading }) {
  const [form,    setForm]    = useState(initial);
  const [showPw,  setShowPw]  = useState(false);
  const [errors,  setErrors]  = useState({});

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.site.trim())     e.site     = 'Site is required';
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password.trim()) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit(form);
  };

  const inputClass = (field) =>
    `w-full bg-[#0D0F14] border rounded-lg px-3 py-2.5 text-sm text-[#E8EAF0] placeholder-[#4A5068] focus:outline-none focus:border-[#00C9A7] transition-colors ${
      errors[field] ? 'border-[#FF4D6D]' : 'border-[#252A3A]'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <label className="block text-xs text-[#7A8099] mb-1.5 font-medium">Site / Service</label>
        <input
          type="text"
          placeholder="github.com"
          value={form.site}
          onChange={update('site')}
          className={inputClass('site')}
          autoFocus
        />
        {errors.site && <p className="text-[#FF4D6D] text-xs mt-1">{errors.site}</p>}
      </div>

      <div>
        <label className="block text-xs text-[#7A8099] mb-1.5 font-medium">Username / Email</label>
        <input
          type="text"
          placeholder="you@example.com"
          value={form.username}
          onChange={update('username')}
          className={inputClass('username')}
        />
        {errors.username && <p className="text-[#FF4D6D] text-xs mt-1">{errors.username}</p>}
      </div>

      <div>
        <label className="block text-xs text-[#7A8099] mb-1.5 font-medium">Password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
            className={`${inputClass('password')} pr-10 font-mono`}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5068] hover:text-[#7A8099] text-xs"
          >
            {showPw ? 'HIDE' : 'SHOW'}
          </button>
        </div>
        {errors.password && <p className="text-[#FF4D6D] text-xs mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-xs text-[#7A8099] mb-1.5 font-medium">Notes <span className="opacity-50">(optional)</span></label>
        <textarea
          rows={2}
          placeholder="Any extra info..."
          value={form.notes}
          onChange={update('notes')}
          className="w-full bg-[#0D0F14] border border-[#252A3A] rounded-lg px-3 py-2.5 text-sm text-[#E8EAF0] placeholder-[#4A5068] focus:outline-none focus:border-[#00C9A7] transition-colors resize-none"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#00C9A7] hover:bg-[#00E8C0] disabled:opacity-50 text-[#0D0F14] font-semibold text-sm py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 border border-[#252A3A] text-[#7A8099] hover:text-[#E8EAF0] text-sm rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>

    </form>
  );
}
