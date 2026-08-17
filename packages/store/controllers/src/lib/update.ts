import type { Context } from 'hono';
import { StoreService, StoreUpdateSchema } from "@quarks/store-data";
import { validate } from '@quarks/share-function';

export const update = async (c: Context) => {
  // 1. Verificación de rol administrativo
  const user = c.get('user');
  if (!user?.isAdmin) return c.text('Unauthorized', 403);

  // 2. Extracción de parámetro de ruta y body
  const domain = c.req.param('domain') ?? '';
  const body = await c.req.json().catch(() => ({}));
  const parsed = validate(StoreUpdateSchema, body);

  // 3. Pasar directamente los datos validados al servicio
  // (La serialización a JSON ya la maneja internamente StoreService.update)
  const updatedStore = await new StoreService(c.get('db')).update(domain, parsed);

  if (!updatedStore) return c.text('Store not found', 404);

  return c.json(updatedStore);
};
