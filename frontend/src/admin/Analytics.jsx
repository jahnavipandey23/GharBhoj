import { useResourceOnce } from '../hooks/useOnce';
import { getOrdersByHour } from '../api/admin';

const hourLabel = (h) => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`;

export default function Analytics() {
  const { data } = useResourceOnce(getOrdersByHour); // [{ hour: 13, count: 9 }, ...]
  const rows = data || [];
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <>
      <div className="mh"><h2>Analytics</h2></div>
      <p className="note">Orders by hour of the day</p>
      <div className="card bars">
        {rows.length === 0 && <span className="note">No orders yet.</span>}
        {rows.map((r) => (
          <div key={r.hour} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: (r.count / max) * 160, background: 'var(--mr)', borderRadius: '4px 4px 0 0' }} />
            <span className="note">{hourLabel(r.hour)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
