import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { stores } from './schema';

export const StoreSchema = createSelectSchema(stores, {
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  api: z.string().url(),
  points: z.string().min(1),
  mapper: z.record(z.string(), z.string()),
  theme: z
    .object({
      background: z.string(),
      primary: z.string(),
      secondary: z.string(),
      text: z.string(),
      logo: z.string(),
    })
    .passthrough(),
});

export const StoreCreateSchema = StoreSchema.omit({
  createdAt: true,
  updatedAt: true,
}).partial({
  isActive: true,
  description: true,
});

export const StoreUpdateSchema = StoreSchema.omit({ id: true }).partial();

export type IStore = z.infer<typeof StoreSchema>;
export type IStoreCreate = z.infer<typeof StoreCreateSchema>;
export type IStoreUpdate = z.infer<typeof StoreUpdateSchema>;
export type IStoreTheme = IStore['theme'];

export interface IStoreService {
  listActive(): Promise<IStore[]>;
  getById(id: string): Promise<IStore | null>;
  create(data: IStoreCreate): Promise<IStore>;
  update(id: string, data: IStoreUpdate): Promise<IStore | null>;
}
