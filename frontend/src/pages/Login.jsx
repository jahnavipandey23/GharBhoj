import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    try { await login({ email: email.trim(), password }); navigate('/admin'); }
    catch (e) { setError(e.message); }
  };

  return (
    <div className="wrap" style={{ maxWidth: 420, padding: '20px 24px 60px' }}>
      <h2 className="pg">Staff Sign In</h2>
      <p className="sub">Manage orders, queue and bookings.</p>
      <div className="card">
        <label htmlFor="le">Email</label>
        <input id="le" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="lp" style={{ marginTop: 12 }}>Password</label>
        <input id="lp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="err">{error}</div>
        <button className="btn full" onClick={submit}>Sign In →</button>
      </div>
    </div>
  );
}
