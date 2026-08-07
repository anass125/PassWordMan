import { useState, useEffect, useMemo } from 'react';
import { usePasswords } from '../hooks/usePasswords';
import PasswordCard from '../components/passwords/PasswordCard';
import PasswordForm from '../components/passwords/PasswordForm';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user }                      = useAuth();
  const { passwords, loading, error, load, add, edit, remove } = usePasswords();

  const [showAddModal,  setShowAddModal]  = useState(false);
  const [editEntry,     setEditEntry]     = useState(null);   // null = no edit modal
  const [deleteId,      setDeleteId]      = useState(null);   // confirm delete
  const [toast,         setToast]         = useState(null);   // { message, type }
  const [search,        setSearch]        = useState('');
  const [formLoading,   setFormLoading]   = useState(false);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return passwords;
    const q = search.toLowerCase();
    return passwords.filter(
      (p) =>
        p.site.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q)
    );
  }, [passwords, search]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Add ──────────────────────────────────────────────────────────────────
  const handleAdd = async (form) => {
    setFormLoading(true);
    const result = await add(form);
    setFormLoading(false);
    if (result.ok) {
      setShowAddModal(false);
      showToast('Password saved');
    } else {
      showToast(result.message, 'error');
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = async (form) => {
    setFormLoading(true);
    const result = await edit(editEntry._id, form);
    setFormLoading(false);
    if (result.ok) {
      setEditEntry(null);
      showToast('Password updated');
    } else {
      showToast(result.message, 'error');
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const result = await remove(deleteId);
    setDeleteId(null);
    if (result.ok) {
      showToast('Password deleted');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#E8EAF0] text-xl font-bold">Your Vault</h1>
          <p className="text-[#7A8099] text-sm mt-0.5">
            {passwords.length} {passwords.length === 1 ? 'entry' : 'entries'} stored
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00E8C0] text-[#0D0F14] font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          <span className="text-base leading-none">+</span> Add entry
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by site or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#141720] border border-[#252A3A] rounded-lg px-4 py-2.5 text-sm text-[#E8EAF0] placeholder-[#4A5068] focus:outline-none focus:border-[#00C9A7] transition-colors"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="text-center py-16 text-[#4A5068] text-sm">Loading your vault...</div>
      )}

      {!loading && error && (
        <div className="text-center py-16 text-[#FF4D6D] text-sm">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          {search ? (
            <>
              <p className="text-[#7A8099] text-sm">No results for "{search}"</p>
              <button onClick={() => setSearch('')} className="text-[#00C9A7] text-xs mt-2 hover:underline">Clear search</button>
            </>
          ) : (
            <>
              <p className="text-[#7A8099] text-sm">Your vault is empty.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-[#00C9A7] text-xs mt-2 hover:underline"
              >
                Add your first entry →
              </button>
            </>
          )}
        </div>
      )}

      {/* Password list */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <PasswordCard
              key={entry._id}
              entry={entry}
              onEdit={(e) => setEditEntry(e)}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAddModal && (
        <Modal title="New entry" onClose={() => setShowAddModal(false)}>
          <PasswordForm
            onSubmit={handleAdd}
            onCancel={() => setShowAddModal(false)}
            loading={formLoading}
          />
        </Modal>
      )}

      {/* Edit modal */}
      {editEntry && (
        <Modal title="Edit entry" onClose={() => setEditEntry(null)}>
          <PasswordForm
            initial={{
              site:     editEntry.site,
              username: editEntry.username,
              password: editEntry.password,
              notes:    editEntry.notes || '',
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditEntry(null)}
            loading={formLoading}
          />
        </Modal>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <Modal title="Delete entry?" onClose={() => setDeleteId(null)}>
          <p className="text-[#7A8099] text-sm mb-5">
            This will permanently remove the entry. You cannot undo this.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="flex-1 bg-[#FF4D6D] hover:bg-[#FF6B84] text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2.5 border border-[#252A3A] text-[#7A8099] hover:text-[#E8EAF0] text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
