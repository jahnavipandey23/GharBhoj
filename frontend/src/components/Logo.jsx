import { useNavigate } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  const navigate = useNavigate();
  return (
    <div className="logo" onClick={() => navigate(to)}>
      <svg width="22" height="9" viewBox="0 0 22 9" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 8l10-6 10 6" /></svg>
      GharBhoj<small>HOMESTYLE KITCHEN</small>
    </div>
  );
}
