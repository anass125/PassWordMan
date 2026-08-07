import { useState, useEffect } from 'react';
import { fetchAllUsers } from '../api/admin';

export default function AdminPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetchAllUsers()
      .then(({ data }) => setUsers(data.users))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-[#E8EAF0] text-xl font-bold">Admin — Users</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFB34720] text-[#FFB347] border border-[#FFB34740] font-medium">
          Admin only
        </span>
      </div>

      {loading && (
        <p className="text-[#4A5068] text-sm py-10 text-center">Loading users...</p>
      )}

      {error && (
        <p className="text-[#FF4D6D] text-sm py-10 text-center">{error}</p>
      )}

      {!loading && !error && (
        <>
          <p className="text-[#7A8099] text-sm mb-4">{users.length} registered users</p>

          <div className="bg-[#141720] border border-[#252A3A] rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 px-5 py-3 border-b border-[#252A3A] text-xs text-[#4A5068] font-medium uppercase tracking-wider">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Joined</span>
            </div>

            {/* Rows */}
            {users.length === 0 ? (
              <p className="text-center text-[#4A5068] text-sm py-8">No users found</p>
            ) : (
              users.map((u) => (
                <div
                  key={u._id}
                  className="grid grid-cols-4 px-5 py-3.5 border-b border-[#252A3A] last:border-0 text-sm hover:bg-[#1C2030] transition-colors"
                >
                  <span className="text-[#E8EAF0] font-medium truncate">{u.name}</span>
                  <span className="text-[#7A8099] truncate">{u.email}</span>
                  <span>
                    {u.role === 'admin' ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFB34720] text-[#FFB347]">admin</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#252A3A] text-[#7A8099]">user</span>
                    )}
                  </span>
                  <span className="text-[#4A5068] text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
