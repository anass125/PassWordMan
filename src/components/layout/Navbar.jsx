import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path
      ? 'text-[#00C9A7] border-b border-[#00C9A7] pb-0.5'
      : 'text-[#7A8099] hover:text-[#E8EAF0] transition-colors';

  return (
    <nav className="sticky top-0 z-50 border-b border-[#252A3A] bg-[#0D0F14]/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="font-mono text-[#00C9A7] font-bold tracking-tight text-lg">PWM</span>
          <span className="text-[#E8EAF0] font-semibold text-sm hidden sm:block">PassWordMan</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/dashboard" className={isActive('/dashboard')}>Vault</Link>
          <Link to="/profile"   className={isActive('/profile')}>Profile</Link>
          {isAdmin && (
            <Link to="/admin"   className={isActive('/admin')}>
              <span className="text-[#FFB347]">Admin</span>
            </Link>
          )}
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          <span className="text-[#4A5068] text-xs hidden sm:block truncate max-w-[140px]">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded border border-[#252A3A] text-[#7A8099] hover:border-[#FF4D6D] hover:text-[#FF4D6D] transition-colors"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}
