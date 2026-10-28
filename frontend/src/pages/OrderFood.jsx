import { useState } from 'react';
import {useNavigate } from 'react-router-dom';
import DishImage from '../components/DishImage';
import { useMenu } from '../hooks/useApi';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import { createOrder } from '../api/orders';
import { summarize } from '../utils/cart';
import { inr } from '../utils/format';

export default function OrderFood() {
  const navigate = useNavigate();
  const { data: menu } = useMenu();
  const { items, change, clear } = useCart();
 const { table, rememberOrder } = useSession();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Customer already has an active order: show its live queue page instead.

  const { lines, subtotal, gst, total } = summarize(menu || [], items);

  if (menu && !lines.length) {
    return (
      <div className="wrap" style={{ textAlign: 'center', padding: '70px 0' }}>
        <h2 className="pg">Order Food</h2>
        <p className="sub">Your order is empty. Add dishes from the menu.</p>
        <button className="btn" onClick={() => navigate('/menu')}>Browse Menu →</button>
      </div>
    );
  }

  const join = async () => {
    if (name.trim().length < 2) { setError('Enter your name to get a token.'); return; }
    setBusy(true);
    try {
      const order = await createOrder({
        customerName: name.trim(),
        table,
        items: lines.map((l) => ({ dishId: l.id, quantity: l.quantity })),
      });
      rememberOrder(order.id);
      clear();
      navigate(`/queue/${order.id}`);
    } catch (e) { setError(e.message); setBusy(false); }
  };

  return (
    <div className="wrap">
      <h2 className="pg">Order Food</h2>
      <p className="sub">Place your order, join the queue and get real-time updates.</p>
      <div className="two">
        <div className="card" style={{ padding: '10px 20px' }}>
          {lines.map((d) => (
            <div className="li" key={d.id}>
              <DishImage dish={d} />
              <div><h3>{d.name}</h3><small>{d.description}</small><b style={{ fontSize: 13 }}>{inr(d.price)}</b></div>
              <div className="st">
                <button aria-label="Remove one" onClick={() => change(d.id, -1)}>−</button>
                <b>{d.quantity}</b>
                <button className="p" aria-label="Add one" onClick={() => change(d.id, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 20, marginBottom: 12 }}>Your Order</h3>
          {lines.map((d) => <div className="r" key={d.id}><span>{d.name}</span><span>{d.quantity} × {inr(d.price)}</span></div>)}
          <div className="r" style={{ marginTop: 12 }}><span className="note">Subtotal</span><span>{inr(subtotal)}</span></div>
          <div className="r"><span className="note">GST (5%)</span><span>{inr(gst)}</span></div>
          <div className="r t"><span>Total</span><span>{inr(total)}</span></div>
          <label htmlFor="on" style={{ marginTop: 14 }}>Name for the token</label>
          <input id="on" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="err">{error}</div>
          <button className="btn full" onClick={join} disabled={busy}>Proceed to Join Queue →</button>
          <p className="note">Pay at the counter when your order is ready.</p>
        </div>
      </div>
    </div>
  );
}
