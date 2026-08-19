import { useState, useEffect } from 'react';
import { Input, Textarea, Button, Spinner } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

export default function ProductForm() {
  const fetch = useFetch();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', isActive: false });

  useEffect(() => {
    const id = window.location.pathname.split('/').pop() || '';
    fetch<any>(`/v1/product/${id}`)
      .then((data) => {
        setForm({
          name: data.name || '',
          description: data.description || '',
          price: String(data.price || ''),
          isActive: data.isActive || false,
        });
      })
      .catch(() => alert('Error al cargar producto'))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string | boolean) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const id = window.location.pathname.split('/').pop() || '';
    try {
      await fetch(`/v1/product/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      alert('Producto actualizado');
    } catch {
      alert('Error al actualizar producto');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Nombre" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      <Textarea label="Descripción" value={form.description} onChange={(e) => update('description', e.target.value)} />
      <Input label="Precio" type="number" value={form.price} onChange={(e) => update('price', e.target.value)} required />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} id="isActive" />
        <label htmlFor="isActive">Activo</label>
      </div>
      <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</Button>
    </form>
  );
}
