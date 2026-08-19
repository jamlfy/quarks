import { useState, useEffect } from 'react';
import { DataTable, Spinner } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

export default function PurchasesTable() {
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetch = useFetch();

  useEffect(() => {
    fetch<{ data: any[] }>('/v1/purchase/')
      .then((res) => {
        setData(
          (res.data ?? []).map((p: any) => [
            String(p.id),
            String(p.amount),
            p.type,
            new Date(p.createdAt).toLocaleDateString(),
          ]),
        );
      })
      .catch(() => setError('Error al cargar compras'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p>{error}</p>;
  if (data.length === 0) return <p>No hay compras registradas</p>;

  return (
    <DataTable
      headings={['ID', 'Monto', 'Tipo', 'Fecha']}
      data={data}
      itemsPerPage={10}
      hover
      striped="row"
    />
  );
}
