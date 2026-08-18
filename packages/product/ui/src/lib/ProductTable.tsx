import { useState, useEffect } from 'react';
import { DataTable, Spinner } from 'webcoreui/react';
import { useFetch } from '@quarks/share-use';

export default function ProductTable() {
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetch = useFetch();

  useEffect(() => {
    fetch<{ data: any[] }>('/v1/product/')
      .then((res) => {
        setData(
          (res.data ?? []).map((p: any) => [
            String(p.id),
            p.name || 'N/A',
            String(p.price || 0),
            p.isActive ? 'Sí' : 'No',
            `<a href="/admin/products/${p.id}">Editar</a>`,
          ]),
        );
      })
      .catch(() => setError('Error al cargar productos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p>{error}</p>;
  if (data.length === 0) return <p>No hay productos registrados</p>;

  return (
    <DataTable
      headings={[
        { name: 'ID', filterable: true },
        'Nombre',
        { name: 'Precio', sortable: true },
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
