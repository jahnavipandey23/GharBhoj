import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import StatusBadge from '../components/StatusBadge';
import { useOrder } from '../hooks/useApi';
import { useSession } from '../context/SessionContext';
import { formatDateTime, inr } from '../utils/format';

const STEPS = ['Order Received', 'In Queue', 'Preparing', 'Ready'];
const STEP_INDEX = { queue: 1, prep: 2, ready: 3, done: 3 };

export default function QueueStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rememberOrder } = useSession();
  const { data: order, loading, error } = useOrder(id); // refetches itself on every live update

  if (loading) return <div className="wrap"><p className="note" style={{ padding: 40 }}>Loading your order…</p></div>;
  if (error || !order) return <div className="wrap"><h2 className="pg">Order not found</h2><button className="btn" onClick={() => { rememberOrder(null); navigate('/menu'); }}>Back to menu</button></div>;

  const step = STEP_INDEX[order.status];
  const isReady = order.status === 'ready' || order.status === 'done';
const isDone = order.status === 'done';

  return (
    <div className="wrap">
      <h2 className="pg">
  {isDone ? 'Order Completed!' : 'Your Order is in Queue'}
</h2>

<p className="sub">
  {isDone
    ? 'Thank you for ordering with GharBhoj!'
    : 'We’ll keep you updated in real time. You can also track this page anytime.'}
</p>
     
<div className="card">
  {isDone ? (
    <div style={{ textAlign: 'center', padding: '24px 12px' }}>
      <Icon name="ok" size={42} />
      <h2 style={{ marginTop: 12 }}>Your Order is Completed!</h2>
      <p className="sub" style={{ marginTop: 8 }}>
        Please pay your bill at the counter.
      </p>
      <p className="note" style={{ marginTop: 8 }}>
        Thank you for dining with GharBhoj!
      </p>
    </div>
  ) : (
    <>
      <div className="vs">
        <div>
          <div className="note">Current Queue Position</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 6 }}>
            <div className="big">#{order.queuePosition ?? order.no}</div>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div>
          <div className="note">Estimated Wait Time</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10, color: 'var(--mr)' }}>
            <Icon name="clock" size={32} />
            <span style={{ font: "600 26px 'Playfair Display',serif", color: 'var(--tx)' }}>
              {isReady ? 'Ready now' : `${order.waitMinutes} – ${order.waitMinutes + 5} mins`}
            </span>
          </div>
          <p className="note" style={{ margin: '10px 0 0' }}>
  {isDone
    ? 'Your order is completed. Please pay your bill at the counter.'
    : 'Pay at the counter when your order is ready.'}
</p>
        </div>
      </div>

      <div className="pr">
        {STEPS.map((s, i) => (
          <div key={s} className={i <= step ? 'd' : ''}>{s}</div>
        ))}
      </div>
    </>
  )}
</div>


      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>Order Details</h3>
        <div className="vs">
          <div>
            <div className="r"><span className="note">Order ID</span><span>#{order.id}</span></div>
            <div className="r"><span className="note">Placed At</span><span>{formatDateTime(order.placedAt)}</span></div>
            <button className="btn o sm" style={{ marginTop: 12 }} onClick={() => { rememberOrder(null); navigate('/menu'); }}>Order more →</button>
          </div>
          <div>
            {order.lines.map((l) => <div className="r" key={l.name}><span>{l.name}</span><span>× {l.quantity} &nbsp; {inr(l.quantity * l.price)}</span></div>)}
            <div className="r t"><span>Total</span><span>{inr(order.total)}</span></div>
          </div>
        </div>
        <p className="note" style={{ margin: '10px 0 0' }}>Pay at the counter when your order is ready.</p>
      </div>
    </div>
  );
}
