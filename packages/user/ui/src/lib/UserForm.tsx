import { useState, useEffect } from 'react';
import { Input, Button, Spinner } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

export default function UserForm() {
  const fetch = useFetch();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', isAdmin: false });

  useEffect(() => {
    const id = window.location.pathname.split('/').pop() || '';
    fetch<any>(`/v1/user/${id}`)
      .then((data) => {
        setForm({ name: data.name || '', email: data.email || '', isAdmin: data.isAdmin || false });
      })
      .catch(() => alert('Error al cargar usuario'))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string | boolean) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const id = window.location.pathname.split('/').pop() || '';
    try {
      await fetch(`/v1/user/${id}`, { method: 'PUT', body: JSON.stringify(form) });
      alert('Usuario actualizado');
    } catch {
      alert('Error al actualizar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Nombre" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input type="checkbox" checked={form.isAdmin} onChange={(e) => update('isAdmin', e.target.checked)} id="isAdmin" />
        <label htmlFor="isAdmin">Admin</label>
      </div>
      <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</Button>
    </form>
  );
}
