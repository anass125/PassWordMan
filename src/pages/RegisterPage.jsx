import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form,  setForm]  = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const result = await register(form.name, form.email, form.password);
    if (result.ok) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const inputClass = "w-full bg-[#0D0F14] border border-[#252A3A] rounded-lg px-4 py-3 text-sm text-[#E8EAF0] placeholder-[#4A5068] focus:outline-none focus:border-[#00C9A7] transition-colors";

  return (
    <div className="min-h-screen bg-[#0D0F14] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00C9A720] border border-[#00C9A740] mb-4">
            <span className="font-mono text-[#00C9A7] font-bold text-lg">PWM</span>
          </div>
          <h1 className="text-[#E8EAF0] text-xl font-bold">Create your vault</h1>
          <p className="text-[#7A8099] text-sm mt-1">Start storing passwords securely</p>
        </div>

        <div className="bg-[#141720] border border-[#252A3A] rounded-2xl p-6">

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-[#FF4D6D20] border border-[#FF4D6D40] text-[#FF4D6D] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#7A8099] mb-1.5 font-medium">Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={update('name')}
                required
                autoFocus
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs text-[#7A8099] mb-1.5 font-medium">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update('email')}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs text-[#7A8099] mb-1.5 font-medium">Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={update('password')}
                required
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#00C9A7] hover:bg-[#00E8C0] disabled:opacity-50 text-[#0D0F14] font-semibold text-sm py-3 rounded-lg transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#7A8099] mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00C9A7] hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
