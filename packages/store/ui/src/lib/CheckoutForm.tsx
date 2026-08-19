import { useState } from 'react';
import { Input, Button } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

export default function CheckoutForm() {
  const fetch = useFetch();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    countryCode: '', region: '', city: '', address: '', zip: '',
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setSubmitting(true);
    try {
      await fetch('/v1/purchase/', {
        method: 'POST',
        body: JSON.stringify({
          products: cart.map((item: any) => ({ id: item.id, quantity: item.quantity || 1 })),
          metadata: { location: form },
        }),
      });
      localStorage.removeItem('cart');
      alert('Compra realizada exitosamente');
      window.location.href = '/purchases';
    } catch {
      alert('Error al procesar la compra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Código de país" value={form.countryCode} onChange={(e) => update('countryCode', e.target.value)} maxLength={2} required placeholder="MX" />
      <Input label="Región/Estado" value={form.region} onChange={(e) => update('region', e.target.value)} required />
      <Input label="Ciudad" value={form.city} onChange={(e) => update('city', e.target.value)} required />
      <Input label="Dirección" value={form.address} onChange={(e) => update('address', e.target.value)} required />
      <Input label="Código postal" value={form.zip} onChange={(e) => update('zip', e.target.value)} required />
      <Button type="submit" disabled={submitting}>{submitting ? 'Procesando...' : 'Proceder al pago'}</Button>
    </form>
  );
}
