import { useState } from 'react';
import { Input, Select, Textarea, Button } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

export default function CreateTestingForm() {
  const fetch = useFetch();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    campaing: '',
    name: '',
    description: '',
    sku: '',
    price: '',
    type: 'TIME',
    countryCode: '',
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/v1/testing/', {
        method: 'POST',
        body: JSON.stringify([{ ...form, price: Number(form.price) }]),
      });
      alert('Testing creado exitosamente');
      setForm({ campaing: '', name: '', description: '', sku: '', price: '', type: 'TIME', countryCode: '' });
    } catch {
      alert('Error al crear testing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Campaña" value={form.campaing} onChange={(e) => update('campaing', e.target.value)} required />
      <Input label="Nombre" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      <Textarea label="Descripción" value={form.description} onChange={(e) => update('description', e.target.value)} required />
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
      <Input label="País" value={form.countryCode} onChange={(e) => update('countryCode', e.target.value)} maxLength={2} required />
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Creando...' : 'Crear testing'}
      </Button>
    </form>
  );
}
