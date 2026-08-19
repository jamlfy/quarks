import { useState, useEffect } from 'react';
import { DataTable, Spinner } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

export default function StoreTable() {
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetch = useFetch();

  useEffect(() => {
    fetch<any[]>('/v1/store/')
      .then((res) => {
        setData(
          (Array.isArray(res) ? res : []).map((s: any) => [
            String(s.id),
            s.name,
            s.api,
            s.isActive ? 'Sí' : 'No',
            `<a href="/admin/store/${s.id}">Editar</a>`,
          ]),
        );
      })
      .catch(() => setError('Error al cargar stores'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p>{error}</p>;
  if (data.length === 0) return <p>No hay stores registradas</p>;

  return (
    <DataTable
      headings={[
        { name: 'ID', filterable: true },
        'Nombre',
        'Dominio',
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
