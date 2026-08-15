import { StatusError } from './errors';
import { PurchaseSchema, StoreSchema, validate } from './validation';

describe('validate', () => {
  it('returns parsed data for valid input', () => {
    const data = validate(PurchaseSchema, {
      productId: 'p1',
      productName: 'X',
      price: 100,
      quantity: 2,
    });
    expect(data).toEqual({
      productId: 'p1',
      productName: 'X',
      price: 100,
      quantity: 2,
    });
  });

  it('applies default quantity', () => {
    const data = validate(PurchaseSchema, {
      productId: 'p1',
      productName: 'X',
      price: 100,
    });
    expect(data.quantity).toBe(1);
  });

  it('throws StatusError with status 400 on invalid input', () => {
    try {
      validate(PurchaseSchema, { productId: '', price: 0 });
      throw new Error('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(StatusError);
      if (error instanceof StatusError) {
        expect(error.status).toBe(400);
      }
    }
  });

  it('validates store schema with JSON mapper/theme', () => {
    const data = validate(StoreSchema, {
      id: 'midomingo',
      name: 'Mi Domingo',
      api: 'https://api.example.com',
      mapper: { title: 'name' },
      points: 'value * 10',
      theme: { primary: '#000' },
    });
    expect(data.id).toBe('midomingo');
    expect(data.mapper).toEqual({ title: 'name' });
  });
});
