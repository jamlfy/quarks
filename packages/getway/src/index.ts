import type { Context } from 'hono';
import { ITransaction } from "@quarks/transaction-data";
import { IUser } from "@quarks/user-data";
import * as Mercadolibre from "./connector/mercadolibre";

export const GETWAY_CONNECTOR: Record<string, typeof Mercadolibre> = {
    [Mercadolibre.name]: Mercadolibre,
};

export const GETWAY_NAMES = Object.keys(GETWAY_CONNECTOR);

export const Getway = (system: string, entry: ITransaction, user: IUser) => {
    const connector = GETWAY_CONNECTOR[system];
    if (!connector) throw new Error("Connector does not exist");

    return connector.getway(entry, user);
};

export const WebHook = async (c: Context) => {
  const system = c.req.param('system') ?? '';
  const connector = GETWAY_CONNECTOR[system];

  if (!connector) {
    return c.text('Connector does not exist', 400);
  }

  return connector.webhook(c);
};
