import { useState, useEffect } from 'react';
import { Card, Spinner } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

interface Campaign {
  name: string;
  count: number;
  activeCount: number;
}

export default function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetch = useFetch();

  useEffect(() => {
    fetch<{ data: any[] }>('/v1/testing/me')
      .then((res) => {
        const map = new Map<string, { count: number; activeCount: number }>();
        (res.data ?? []).forEach((t: any) => {
          const existing = map.get(t.campaing) ?? { count: 0, activeCount: 0 };
          existing.count++;
          if (t.isActive) existing.activeCount++;
          map.set(t.campaing, existing);
        });
        setCampaigns(
          Array.from(map.entries()).map(([name, { count, activeCount }]) => ({
            name,
            count,
            activeCount,
          })),
        );
      })
      .catch(() => setError('Error al cargar campañas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p>{error}</p>;
  if (campaigns.length === 0) return <p>No hay campañas creadas</p>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
      {campaigns.map((c) => (
        <a key={c.name} href={`/panel/${c.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Card compact title={c.name}>
            <p>{c.count} testings</p>
            <p>{c.activeCount} activos</p>
          </Card>
        </a>
      ))}
    </div>
  );
}
