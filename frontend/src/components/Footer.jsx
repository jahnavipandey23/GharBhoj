import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--ln)', marginTop: 20 }}>
      <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 24, padding: '30px 24px' }}>
        <div><Logo /></div>
        <div><b>Opening hours</b><p className="note">Every day, 11 am to 11 pm</p></div>
        <div><b>Visit us</b><p className="note">Sector 62, Noida<br />+91 98765 43210</p></div>
        <div>
          <b>Quick links</b>
          <p className="note">
            {[['/', 'Home'], ['/menu', 'Menu'], ['/book', 'Book Table'], ['/order', 'Order Food']].map(([to, l]) => (
              <Link key={to} to={to} style={{ marginRight: 10, color: 'inherit' }}>{l}</Link>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
