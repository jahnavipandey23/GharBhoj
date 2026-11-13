import { useState } from 'react';
import Icon from '../components/Icon';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useOrders } from '../hooks/useApi';
import { useNow } from '../hooks/useNow';
import { setOrderStatus } from '../api/orders';
import { formatCountdown, formatDateTime, inr } from '../utils/format';

const itemsText = (o) => o.lines.map((l) => `${l.name} × ${l.quantity}`).join(', ');
const byPosition = (key) => (a, b) => (a[key] ?? 0) - (b[key] ?? 0);
const title = { fontSize: 20, margin: '26px 0 4px' };

export default function OrdersQueue() {
 const { data, reload, error } = useOrders(); // live: updates when any order changes // live: updates when any order changes
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState('');
  const orders = data || [];

  const prep = orders.filter((o) => o.status === 'queue' || o.status === 'prep').sort(byPosition('prepPosition'));
  const ready = orders.filter((o) => o.status === 'ready').sort(byPosition('pickupPosition'));
  const done = orders.filter((o) => o.status === 'done');
  const cancelled = orders.filter((o) => o.status === 'cancelled');
  const now = useNow(ready.length > 0); // ticks every second only when there is a pickup countdown to show

  const move = async (id, status) => {
    setBusy(id); setMessage('');
    try { await setOrderStatus(id, status); }
    catch (e) { setMessage(e.message); }       // e.g. "Pickup time is over" or another admin already moved it
    finally { setBusy(null); reload(); }
  };

  const prepAction = (o) => (o.status === 'queue'
    ? <button className="btn sm" disabled={busy === o.id} onClick={() => move(o.id, 'prep')}><Icon name="play" size={12} /> Start Preparing</button>
    : <button className="btn o sm" style={{ color: 'var(--mr)', borderColor: 'var(--mr)' }} disabled={busy === o.id} onClick={() => move(o.id, 'ready')}><Icon name="ok" size={12} /> Mark Ready</button>);

  const timeLeft = (o) => {
    const ms = new Date(o.pickupDeadline).getTime() - now;
    return ms > 0 ? formatCountdown(ms) : 'Cancelling…';
  };

  return (
    <>
      <div className="mh">
        <h2>Orders &amp; Queue</h2><span className="live">● Live</span>
        <div className="sp">
          <span className="chipd">{formatDateTime()}</span>
        </div>
      </div>
    {error && <p className="err" role="alert">Could not load orders: {error.message}</p>}

      <h3 style={title}>Preparation Queue ({prep.length})</h3>
      <p className="note">Orders waiting to be cooked or being cooked. Token never changes; position moves up as orders become ready.</p>
      <DataTable
        head={['Token', 'Queue Pos.', 'Customer', 'Items', 'Total', 'Status', 'Actions']}
        rows={prep.map((o) => [`#${o.no}`, o.prepPosition, o.name, itemsText(o), inr(o.total), <StatusBadge status={o.status} />, prepAction(o)])}
      />

      <h3 style={title}>Pickup Waitlist ({ready.length})</h3>
      <p className="note">Food is ready. Orders not collected within 40 minutes are cancelled automatically.</p>
      <DataTable
        head={['Token', 'Pickup Pos.', 'Customer', 'Items', 'Total', 'Auto-cancel in', 'Actions']}
        rows={ready.map((o) => [
          `#${o.no}`, o.pickupPosition, o.name, itemsText(o), inr(o.total),
          <b style={{ color: 'var(--mr)' }}>{timeLeft(o)}</b>,
          <button className="btn o sm" disabled={busy === o.id} onClick={() => move(o.id, 'done')}>Mark Collected</button>,
        ])}
      />

      <h3 style={title}>Completed Orders ({done.length})</h3>
      <DataTable
        head={['Token', 'Customer', 'Items', 'Total', 'Status']}
        rows={done.map((o) => [`#${o.no}`, o.name, itemsText(o), inr(o.total), <StatusBadge status={o.status} />])}
      />

      <h3 style={title}>Cancelled Orders ({cancelled.length})</h3>
      <DataTable
        head={['Token', 'Customer', 'Items', 'Total', 'Cancelled at', 'Status']}
        rows={cancelled.map((o) => [`#${o.no}`, o.name, itemsText(o), inr(o.total), o.cancelledAt ? formatDateTime(o.cancelledAt) : '-', <StatusBadge status={o.status} />])}
      />

      <div className="stats">
        <div><b>{orders.filter((o) => o.status === 'queue').length}</b>In Queue</div>
        <div><b>{orders.filter((o) => o.status === 'prep').length}</b>Preparing</div>
        <div><b>{ready.length}</b>Ready for pickup</div>
        <div><b>{done.length}</b>Completed Today</div>
        <div><b>{cancelled.length}</b>Cancelled</div>
      </div>
    </>
  );
}