import { useState, useEffect } from 'react';
import { Card, Spinner } from 'webcoreui/react';
import { useAuth } from '@quarks/user-use';

export default function ProfileCard() {
  const { me, getMe } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMe().finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <Spinner />;
  if (!me?.id) return <p>No se pudo cargar el perfil</p>;

  return (
    <Card title="Mi perfil" compact>
      <dl>
        <dt>ID</dt>
        <dd>{String(me.id || 'N/A')}</dd>
        <dt>Nombre</dt>
        <dd>{String((me as Record<string, unknown>).name || 'N/A')}</dd>
        <dt>Email</dt>
        <dd>{String((me as Record<string, unknown>).email || 'N/A')}</dd>
        <dt>Admin</dt>
        <dd>{(me as Record<string, unknown>).isAdmin ? 'Sí' : 'No'}</dd>
      </dl>
    </Card>
  );
}
