import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useSession } from '../context/SessionContext';

const OPTIONS = [
  ['/book', 'cal', 'Book Table', 'Reserve a spot for later'],
  ['/menu', 'book', 'View Menu', 'Browse our homestyle dishes'],
  ['/order', 'fork', 'Order Food', 'Join the queue and get a live token'],
];

// Shown right after the customer scans the QR code.
export default function WelcomePopup() {
  const { welcomeOpen, closeWelcome, table } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeWelcome();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeWelcome]);

  if (!welcomeOpen) return null;
  const choose = (to) => { closeWelcome(); navigate(to); };

  return (
    <div className="ov" onClick={(e) => e.target === e.currentTarget && closeWelcome()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Welcome">
        <div className="eye">TABLE {table}</div>
        <h2 style={{ fontSize: 28, margin: '8px 0 4px' }}>Welcome to GharBhoj</h2>
        <p className="note" style={{ margin: 0 }}>What would you like to do?</p>
        {OPTIONS.map(([to, icon, title, desc]) => (
          <button key={to} className={`opt ${to === '/order' ? 'pri' : ''}`} onClick={() => choose(to)}>
            <i><Icon name={icon} size={22} /></i>
            <div><b>{title}</b><span>{desc}</span></div>
          </button>
        ))}
        <button className="btn o full" style={{ marginTop: 14 }} onClick={closeWelcome}>Close</button>
      </div>
    </div>
  );
}
