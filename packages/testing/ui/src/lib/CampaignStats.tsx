import { useState, useEffect } from 'react';
import { Card, Spinner } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

export default function CampaignStats() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetch = useFetch();

  useEffect(() => {
    const id = window.location.pathname.split('/').pop() || '';
    fetch<any>('/v1/testing/campaing/' + id)
      .then(setData)
      .catch(() => setError('Error al cargar estadísticas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p>{error}</p>;
  if (!data) return <p>No se encontró la campaña</p>;

  const items = [
    { label: 'Nombre', value: data.name },
    { label: 'SKU', value: data.sku },
    { label: 'Precio', value: '$' + data.price },
    { label: 'Tipo', value: data.type },
    { label: 'Estado', value: data.isActive ? 'Activo' : 'Inactivo' },
    { label: 'País', value: data.countryCode },
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {items.map((item) => (
          <Card key={item.label} compact secondary>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{item.label}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0.25rem 0 0' }}>{item.value}</p>
          </Card>
        ))}
      </div>
      {data.description && (
        <Card title="Descripción" compact>
          <p>{data.description}</p>
        </Card>
      )}
      {data.images?.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3>Imágenes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
            {data.images.map((img: string, i: number) => (
              <img key={i} src={img} alt="Testing" style={{ width: '100%', borderRadius: '0.375rem' }} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
