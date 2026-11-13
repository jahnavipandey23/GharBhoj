import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import StatusBadge from '../components/StatusBadge';
import { useOrder } from '../hooks/useApi';
import { useNow } from '../hooks/useNow';
import { useSession } from '../context/SessionContext';
import { formatCountdown, formatDateTime, inr } from '../utils/format';

const STEPS = ['Order Received', 'In Queue', 'Preparing', 'Ready'];
const STEP_INDEX = { queue: 1, prep: 2, ready: 3 };

export default function QueueStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rememberOrder } = useSession();
  const { data: order, loading, error, reload } = useOrder(id); // refetches itself on every live update

  const status = order?.status;
  const inPrep = status === 'queue' || status === 'prep';
  const now = useNow(status === 'ready'); // 1-second tick only while the pickup countdown is visible

  // The wait time counts down while food is being prepared, so refresh quietly every 30 seconds.
  useEffect(() => {
    if (!inPrep) return undefined;
    const t = setInterval(reload, 30_000);
    return () => clearInterval(t);
  }, [inPrep, reload]);

  if (loading) return <div className="wrap"><p className="note" style={{ padding: 40 }}>Loading your order…</p></div>;
  if (error || !order) return <div className="wrap"><h2 className="pg">Order not found</h2><button className="btn" onClick={() => { rememberOrder(null); navigate('/menu'); }}>Back to menu</button></div>;

  const isReady = status === 'ready';
  const isDone = status === 'done';
  const isCancelled = status === 'cancelled';
  const step = STEP_INDEX[status];
  const wait = Math.max(1, order.waitMinutes);
  const pickupMsLeft = isReady && order.pickupDeadline ? new Date(order.pickupDeadline).getTime() - now : 0;

  const heading = isDone ? 'Order Completed!' : isCancelled ? 'Order Cancelled' : isReady ? 'Your Order is Ready!' : 'Your Order is in Queue';
  const subheading = isDone ? 'Thank you for ordering with GharBhoj!'
    : isCancelled ? 'This order was not collected in time.'
    : isReady ? 'Please collect your food from the counter.'
    : 'We’ll keep you updated in real time. You can also track this page anytime.';

  return (
    <div className="wrap">
      <h2 className="pg">{heading}</h2>
      <p className="sub">{subheading}</p>

      <div className="card">
        {isDone && (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <Icon name="ok" size={42} />
            <h2 style={{ marginTop: 12 }}>Your Order is Completed!</h2>
            <p className="note" style={{ marginTop: 8 }}>Token #{order.no} · Thank you for dining with GharBhoj!</p>
          </div>
        )}

        {isCancelled && (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <Icon name="clock" size={42} />
            <h2 style={{ marginTop: 12 }}>Your Order was Cancelled</h2>
            <p className="sub" style={{ marginTop: 8 }}>Token #{order.no} was not collected within 40 minutes of being ready.</p>
            <p className="note" style={{ marginTop: 8 }}>You can place a new order anytime.</p>
          </div>
        )}

        {(inPrep || isReady) && (
          <>
            <div className="vs">
              <div>
                <div className="note">Your Token Number</div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 6 }}>
                  <div className="big">#{order.no}</div>
                  <StatusBadge status={status} />
                </div>
                {inPrep && (
                  <p className="note" style={{ margin: '10px 0 0' }}>
                    Position in preparation queue: <b style={{ color: 'var(--tx)' }}>{order.prepPosition ?? '-'}</b>
                  </p>
                )}
              </div>

              {inPrep && (
                <div>
                  <div className="note">Estimated Wait Time</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10, color: 'var(--mr)' }}>
                    <Icon name="clock" size={32} />
                    <span style={{ font: "600 26px 'Playfair Display',serif", color: 'var(--tx)' }}>{wait} – {wait + 5} mins</span>
                  </div>
                  <p className="note" style={{ margin: '10px 0 0' }}>Based on the dishes in your order. Pay at the counter when your order is ready.</p>
                </div>
              )}

              {isReady && (
                <div>
                  <div className="note">Ready for pickup. Please collect within</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10, color: 'var(--mr)' }}>
                    <Icon name="clock" size={32} />
                    <span style={{ font: "600 26px 'Playfair Display',serif", color: 'var(--tx)' }}>{formatCountdown(pickupMsLeft)}</span>
                  </div>
                  <p className="note" style={{ margin: '10px 0 0' }}>Orders not collected in time are cancelled automatically. Pay at the counter.</p>
                </div>
              )}
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
            <div className="r"><span className="note">Token</span><span>#{order.no}</span></div>
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