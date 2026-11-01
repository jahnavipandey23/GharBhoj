import { useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';

const NAV = [['/', 'Home'], ['/menu', 'Menu'], ['/book', 'Book Table'], ['/order', 'Order Food']];

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { count } = useCart();
  const { isAdmin, openWelcome } = useSession();
  const active = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to) || (to === '/order' && pathname.startsWith('/queue')));

  return (
    <header>
      <div className="wrap hd">
        <Logo />
        <nav className="nv">
          {NAV.map(([to, label]) => (
            <button key={to} className={active(to) ? 'on' : ''} onClick={() => navigate(to)}>
              {label}{to === '/order' && count ? ` (${count})` : ''}
            </button>
          ))}
        </nav>
        {/* <button className="ib" aria-label="Search"><Icon name="search" /></button> */}
        {/* <button className="ib" aria-label="Show QR options" onClick={openWelcome}><Icon name="user" /></button> */}
        <button className="btn sm" onClick={() => navigate(isAdmin ? '/admin' : '/login')}>{isAdmin ? 'Admin' : 'Sign In'}</button>
      </div>
    </header>
  );
}
