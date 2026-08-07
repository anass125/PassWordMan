import { useState, useCallback } from 'react';
import {
  fetchPasswords,
  createPassword,
  updatePassword,
  deletePassword,
} from '../api/passwords';

export function usePasswords() {
  const [passwords, setPasswords] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchPasswords();
      setPasswords(data.data.passwords);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load passwords');
    } finally {
      setLoading(false);
    }
  }, []);

  const add = useCallback(async (payload) => {
    try {
      const { data } = await createPassword(payload);
      setPasswords((prev) => [data.data.password, ...prev]);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Failed to save' };
    }
  }, []);

  const edit = useCallback(async (id, payload) => {
    try {
      const { data } = await updatePassword(id, payload);
      setPasswords((prev) =>
        prev.map((p) => (p._id === id ? data.data.password : p))
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Failed to update' };
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await deletePassword(id);
      setPasswords((prev) => prev.filter((p) => p._id !== id));
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Failed to delete' };
    }
  }, []);

  return { passwords, loading, error, load, add, edit, remove };
}
