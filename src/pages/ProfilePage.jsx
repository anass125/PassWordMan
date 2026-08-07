import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const field = (label, value) => (
    <div className="py-3 border-b border-[#252A3A] last:border-0">
      <p className="text-xs text-[#4A5068] font-medium mb-0.5">{label}</p>
      <p className="text-[#E8EAF0] text-sm">{value}</p>
    </div>
  );

  return (
    <div className="max-w-md">
      <h1 className="text-[#E8EAF0] text-xl font-bold mb-6">Profile</h1>

      <div className="bg-[#141720] border border-[#252A3A] rounded-2xl px-6 py-2 mb-4">
        {field('Name',  user?.name)}
        {field('Email', user?.email)}
        {field('Role',  user?.role === 'admin' ? '⚡ Admin' : 'User')}
        {field('ID',    user?.id)}
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-2.5 border border-[#FF4D6D40] text-[#FF4D6D] hover:bg-[#FF4D6D10] text-sm font-medium rounded-lg transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
