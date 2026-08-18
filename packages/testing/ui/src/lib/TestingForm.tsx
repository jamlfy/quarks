import { useState, useEffect } from 'react';
import { Input, Select, Textarea, Button, Spinner } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

export default function TestingForm() {
  const fetch = useFetch();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', campaing: '', sku: '', price: '', type: 'TIME', isActive: false,
  });

  useEffect(() => {
    const id = window.location.pathname.split('/').pop() || '';
    fetch<any>(`/v1/testing/campaing/${id}`)
      .then((data) => {
        setForm({
          name: data.name || '',
          description: data.description || '',
          campaing: data.campaing || '',
          sku: data.sku || '',
          price: String(data.price || ''),
          type: data.type || 'TIME',
          isActive: data.isActive || false,
        });
      })
      .catch(() => alert('Error al cargar testing'))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string | boolean) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const id = window.location.pathname.split('/').pop() || '';
    try {
      await fetch(`/v1/testing/campaing/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      alert('Testing actualizado');
    } catch {
      alert('Error al actualizar testing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Nombre" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      <Textarea label="Descripción" value={form.description} onChange={(e) => update('description', e.target.value)} required />
      <Input label="Campaña" value={form.campaing} onChange={(e) => update('campaing', e.target.value)} required />
      <Input label="SKU" value={form.sku} onChange={(e) => update('sku', e.target.value)} required />
      <Input label="Precio" type="number" value={form.price} onChange={(e) => update('price', e.target.value)} required />
      <Select
        label="Tipo"
        value={form.type}
        onChange={(e) => update('type', e.target.value)}
        options={[
          { label: 'Tiempo', value: 'TIME' },
          { label: 'Vistas', value: 'VIEWS' },
          { label: 'Carrito', value: 'CART' },
          { label: 'Compras', value: 'PURCHASES' },
        ]}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} id="isActive" />
        <label htmlFor="isActive">Activo</label>
      </div>
      <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</Button>
    </form>
  );
}
