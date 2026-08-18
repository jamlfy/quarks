import { useState, useEffect } from 'react';
import { Table, Button, Card } from 'webcoreui/react';

interface CartItem {
  id: string;
  quantity: number;
  name?: string;
  price?: number;
}

function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function setCart(cart: CartItem[]) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export default function CartView() {
  const [cart, setCartState] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const items = getCart();
    setCartState(items);
    setTotal(items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0));
  }, []);

  const removeItem = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
    setCartState(updated);
    setTotal(updated.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0));
  };

  if (cart.length === 0) return <p>El carrito está vacío</p>;

  return (
    <>
      <Table
        headings={['Producto', 'Cantidad', 'Precio', 'Subtotal', 'Acciones']}
        data={cart.map((item) => [
          item.name || item.id,
          String(item.quantity),
          '$' + item.price,
          '$' + (item.price || 0) * item.quantity,
        ])}
        hover
        striped="row"
      />
      <div>
        {cart.map((item, i) => (
          <button key={i} onClick={() => removeItem(i)}>Eliminar</button>
        ))}
      </div>
      <Card compact secondary>
        <p><strong>Total: ${total}</strong></p>
      </Card>
      <a href="/cart/checkout" style={{ display: 'inline-block', marginTop: '1rem' }}>
        <Button>Ir a checkout</Button>
      </a>
    </>
  );
}
