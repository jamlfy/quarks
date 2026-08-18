import { useState, useEffect } from 'react';
import { DataTable, Spinner } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

export default function UserTable() {
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetch = useFetch();

  useEffect(() => {
    fetch<{ data: any[] }>('/v1/user/')
      .then((res) => {
        setData(
          (res.data ?? []).map((u: any) => [
            String(u.id),
            u.name,
            u.email,
            u.isAdmin ? 'Sí' : 'No',
            `<a href="/admin/user/${u.id}">Editar</a>`,
          ]),
        );
      })
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p>{error}</p>;
  if (data.length === 0) return <p>No hay usuarios registrados</p>;

  return (
    <DataTable
      headings={[
        { name: 'ID', filterable: true },
        'Nombre',
        { name: 'Email', filterable: true },
        'Admin',
        'Acciones',
      ]}
      data={data}
      itemsPerPage={10}
      hover
      striped="row"
    />
  );
}
