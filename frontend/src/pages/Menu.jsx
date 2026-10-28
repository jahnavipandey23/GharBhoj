
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DishCard from '../components/DishCard';
import { useMenu } from '../hooks/useApi';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../data/categories';
import { summarize } from '../utils/cart';
import { inr } from '../utils/format';

export default function Menu() {
  const { data: menu, loading, error } = useMenu();
  const { items, count, change } = useCart();
  const [category, setCategory] = useState('All');
  const [lastAdded, setLastAdded] = useState(null);
  const [toast, setToast] = useState('');
  const timer = useRef(null);
  const navigate = useNavigate();

  const dishes = (menu || []).filter(
    (d) => category === 'All' || d.category === category
  );

  const cart = summarize(menu || [], items);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  function addToCart(id) {
    const dish = (menu || []).find((d) => d.id === id);
    if (!dish) return;

    change(id, 1);
    setLastAdded(dish);
    setToast(`${dish.name} added to cart!`);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2500);
  }

  return (
    <div className="wrap menu-page">
      <style>{`
        .menu-page { padding-bottom: 115px; }

        .menu-toast {
          position: fixed;
          top: 88px;
          left: 50%;
          transform: translate(-50%, -16px);
          z-index: 120;
          background: #216e43;
          color: white;
          padding: 13px 22px;
          border-radius: 12px;
          box-shadow: 0 8px 28px #0002;
          font-size: 13px;
          font-weight: 600;
          opacity: 0;
          pointer-events: none;
          animation: menuToastIn .25s ease forwards;
          max-width: calc(100vw - 32px);
          text-align: center;
        }

        @keyframes menuToastIn {
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .menu-cart-bar {
          position: fixed;
          z-index: 100;
          bottom: max(16px, env(safe-area-inset-bottom));
          left: 50%;
          transform: translateX(-50%);
          width: min(680px, calc(100% - 28px));
          background: #590b19;
          color: white;
          border-radius: 15px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 32px #2a101544;
          animation: cartSlideUp .32s cubic-bezier(.2,.8,.2,1);
        }

        @keyframes cartSlideUp {
          from { opacity: 0; transform: translate(-50%, 35px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .menu-cart-icon {
          width: 43px;
          height: 43px;
          border-radius: 10px;
          background: #ffffff1c;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          font-size: 22px;
        }

        .menu-cart-info {
          min-width: 0;
          flex: 1;
        }

        .menu-cart-info strong {
          display: block;
          font-size: 13px;
        }

        .menu-cart-info small {
          display: block;
          color: #f0dce0;
          font-size: 11px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .menu-cart-button {
          border: 0;
          border-radius: 9px;
          padding: 11px 14px;
          background: #fff;
          color: #590b19;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
        }

        .menu-cart-button:active {
          transform: scale(.96);
        }

        @media (max-width: 420px) {
          .menu-cart-bar { gap: 9px; padding: 10px; }
          .menu-cart-icon { width: 36px; height: 36px; }
          .menu-cart-button { padding: 10px; font-size: 11px; }
          .menu-cart-info strong { font-size: 12px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .menu-toast, .menu-cart-bar { animation: none; opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <div className="ban">
        <h1>Our Menu</h1>
        <p>
          A carefully curated selection of homestyle dishes made with
          authentic ingredients.
        </p>
      </div>

      <div className="tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`tb ${c === category ? 'on' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <p className="note">Loading menu…</p>}

      {error && (
        <p className="err">Could not load the menu. {error.message}</p>
      )}

      <div className="grid">
        {dishes.map((d) => (
          <DishCard
            key={d.id}
            dish={d}
            onAdd={addToCart}
          />
        ))}

        {!loading && !dishes.length && (
          <p className="note">No dishes in this category yet.</p>
        )}
      </div>

      {toast && (
        <div className="menu-toast" role="status" key={toast}>
          ✓ {toast}
        </div>
      )}

      {count > 0 && (
        <div className="menu-cart-bar" role="region" aria-label="Your cart">
          <div className="menu-cart-icon">🛒</div>

          <div className="menu-cart-info">
            <strong>
              {count} {count === 1 ? 'item' : 'items'} in cart
            </strong>
            <small>
              {lastAdded ? `Added: ${lastAdded.name}` : 'Your food selection'}
              {' · '}
              {inr(cart.total)}
            </small>
          </div>

          <button
            className="menu-cart-button"
            onClick={() => navigate('/order')}
          >
            View Cart →
          </button>
        </div>
      )}
    </div>
  );
}
