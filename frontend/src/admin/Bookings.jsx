import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { listBookings, verifyBooking, rejectBooking } from '../api/bookings';

export default function Bookings() {
  const [data, setData] = useState([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [methods, setMethods] = useState({});
  const load = async () => { try { setData(await listBookings()); } catch (e) { setError(e.message); } };
  useEffect(() => { load(); const timer = setInterval(load, 10000); return () => clearInterval(timer); }, []);
  const act = async (b, action) => {
    if (action === 'verify' && !window.confirm(`Have you received ₹${b.depositAmount || 100} at the counter for ${b.ref}?`)) return;
    setBusy(b.ref); setError('');
    try {
      if (action === 'verify') await verifyBooking(b.ref, methods[b.ref] || 'cash');
      else await rejectBooking(b.ref);
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(''); }
  };
  return <>
    <div className="mh"><h2>Table Bookings</h2></div>
    <p className="note">Collect the advance at the counter before verifying. Pending requests do not reserve a table.</p>
    {error && <p className="err" role="alert">{error}</p>}
    <DataTable head={['Ref', 'Name', 'Phone', 'Guests', 'Date', 'Time', 'Status', 'Advance', 'Actions']} rows={data.map(b => [
      b.ref, b.name, b.phone, b.guests,
      new Date(b.date + 'T12:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      b.time, b.status || 'pending',
      b.paymentStatus === 'paid' ? `₹${b.depositAmount || 100} paid (${b.paymentMethod})` : `₹${b.depositAmount || 100} unpaid`,
      b.status === 'pending' || !b.status ? <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <select aria-label={`Payment method for ${b.ref}`} style={{ minWidth: 80 }} value={methods[b.ref] || 'cash'} onChange={e => setMethods(m => ({ ...m, [b.ref]: e.target.value }))}>
          <option value="cash">Cash</option><option value="upi">UPI</option>
        </select>
        <button className="btn sm" disabled={busy === b.ref} onClick={() => act(b, 'verify')}>Verify</button>
        <button className="btn o sm" disabled={busy === b.ref} onClick={() => act(b, 'reject')}>Reject</button>
      </div> : '—'
    ])} />
  </>;
}
