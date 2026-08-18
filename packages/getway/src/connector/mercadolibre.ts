import type { Context } from 'hono';
import type { ITransaction } from '@quarks/transaction-data';
import type { IUser } from '@quarks/user-data';
import { getEnv, ENV, DEFAULTS } from '@quarks/share-const';

export const name = 'Mercadolibre';

export const getway = async (
  entry: ITransaction,
  user: IUser,
  envObj?: Record<string, any>,
) => {
  const FRONTEND_URL = String(
    getEnv(envObj, ENV.FRONTEND_URL, DEFAULTS.FRONTEND_URL),
  );
  const BACKEND_URL = String(
    getEnv(envObj, ENV.BACKEND_URL, DEFAULTS.BACKEND_URL),
  );
  const ACCESS_TOKEN = String(
    getEnv(
      envObj,
      ENV.MERCADO_PAGO_ACCESS_TOKEN,
      DEFAULTS.MERCADO_PAGO_ACCESS_TOKEN,
    ),
  );

  const cart = (entry.metadata?.['cart'] ?? []) as Array<any>;

  const payload = {
    items: cart.map((item: any) => ({
      id: item.id,
      title: item.title,
      quantity: 1,
      unit_price: item.price,
      currency_id: item.currency,
    })),
    external_reference: entry.id,
    back_urls: {
      success: `${FRONTEND_URL}/checkout?status=success`,
      failure: `${FRONTEND_URL}/checkout?status=failure`,
      pending: `${FRONTEND_URL}/checkout?status=pending`,
    },
    auto_return: 'approved',

    // URL donde Mercado Pago notifica el cambio de estado (Webhook)
    notification_url: `${BACKEND_URL}/${ENV.API_VERSION}/webhook/${name}`,
  };

  const response = await fetch(
    'https://api.mercadopago.com/checkout/preferences',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(ACCESS_TOKEN ? { Authorization: `Bearer ${ACCESS_TOKEN}` } : {}),
      },
      body: JSON.stringify(payload),
    },
  );

  const { url, id } = (await response.json()) as { url?: string; id?: string };

  return {
    url,
    id,
  };
};

export const webhook = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));

  const ACCESS_TOKEN = String(
    getEnv(
      c.env,
      ENV.MERCADO_PAGO_ACCESS_TOKEN,
      DEFAULTS.MERCADO_PAGO_ACCESS_TOKEN,
    ),
  );

  const paymentId = body.data?.id;
  const topic = body.type || body.topic;

  if (topic === 'payment' && paymentId) {
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      },
    );

    if (res.ok) {
      const { external_reference: orderId, status } = (await res.json()) as {
        external_reference?: string;
        status?: string;
      };

      if (status === 'approved' && orderId) {
        await c.env.EVENT_QUEUE.send({
          type: 'TRANSACTION_ACTIVE',
          payload: {
            orderId,
          },
        });
      }
    }
  }

  return c.text('OK', 200);
};
