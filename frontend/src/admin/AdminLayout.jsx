import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import { useSession } from '../context/SessionContext';

const SECTIONS = [
  ['dashboard', 'Dashboard', 'grid'], ['orders', 'Orders / Queue', 'list'], ['bookings', 'Table Bookings', 'cal'],
  ['menu', 'Menu Management', 'edit'], ['customers', 'Customers', 'users'], ['analytics', 'Analytics', 'chart'], ['settings', 'Settings', 'cog'],
];

export default function AdminLayout() {
  const { logout } = useSession();
  const navigate = useNavigate();
  return (
    <div className="adm">
      <aside className="side">
        <Logo />
        {SECTIONS.map(([path, label, icon]) => (
          <NavLink key={path} to={path} className={({ isActive }) => (isActive ? 'on' : '')}>
            <Icon name={icon} size={16} />{label}
          </NavLink>
        ))}
        <a className="lo" onClick={() => { logout(); navigate('/'); }}><Icon name="out" size={16} />Log Out</a>
      </aside>
      <div className="main"><Outlet /></div>
    </div>
  );
}
