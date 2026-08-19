import { useState, useEffect } from 'react';
import { Input, Textarea, Button, Spinner } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

export default function StoreForm() {
  const fetch = useFetch();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', api: '', points: '' });

  useEffect(() => {
    const id = window.location.pathname.split('/').pop() || '';
    fetch<any>(`/v1/store/${id}`)
      .then((data) => {
        setForm({
          name: data.name || '',
          description: data.description || '',
          api: data.api || '',
          points: data.points || '',
        });
      })
      .catch(() => alert('Error al cargar store'))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const id = window.location.pathname.split('/').pop() || '';
    try {
      await fetch(`/v1/store/${id}`, { method: 'PUT', body: JSON.stringify(form) });
      alert('Store actualizada');
    } catch {
      alert('Error al actualizar store');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Nombre" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      <Textarea label="Descripción" value={form.description} onChange={(e) => update('description', e.target.value)} />
      <Input label="URL API" type="url" value={form.api} onChange={(e) => update('api', e.target.value)} required />
      <Input label="Puntos" value={form.points} onChange={(e) => update('points', e.target.value)} required />
      <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</Button>
    </form>
  );
}
