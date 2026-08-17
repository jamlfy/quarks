import type { Context } from 'hono';
import { StoreService, StoreSchema } from "@quarks/store-data";
import { validate } from '@quarks/share-function';

export const create = async (c: Context) => {
    const user = c.get('user');
    if (!user?.isAdmin) return c.text('Unauthorized', 403);

    const body = await c.req.json().catch(() => ({}));
    const parsed = validate(StoreSchema, body);

    const storeService = new StoreService(c.get('db'));
    const created = await storeService.create({
        id: parsed.id,
        name: parsed.name,
        description: parsed.description ?? undefined,
        api: parsed.api,
        mapper: parsed.mapper,
        points: parsed.points,
        theme: parsed.theme,
    });

    return c.json(created, 201);
};
