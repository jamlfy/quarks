import { useState, useEffect } from 'react';
import { DataTable, Spinner } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

export default function TestingTable() {
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetch = useFetch();

  useEffect(() => {
    fetch<{ data: any[] }>('/v1/testing/')
      .then((res) => {
        setData(
          (res.data ?? []).map((t: any) => [
            String(t.id),
            t.name,
            t.campaing,
            t.type,
            t.isActive ? 'Sí' : 'No',
            `<a href="/admin/testing/${t.id}">Editar</a>`,
          ]),
        );
      })
      .catch(() => setError('Error al cargar testings'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p>{error}</p>;
  if (data.length === 0) return <p>No hay testings registrados</p>;

  return (
    <DataTable
      headings={[
        { name: 'ID', filterable: true },
        'Nombre',
        { name: 'Campaña', filterable: true },
        'Tipo',
        'Activo',
        'Acciones',
      ]}
      data={data}
      itemsPerPage={10}
      hover
      striped="row"
    />
  );
}
