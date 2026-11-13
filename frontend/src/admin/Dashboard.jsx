import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useOrders } from '../hooks/useApi';
import { useResourceOnce } from '../hooks/useOnce';
import { listBookings } from '../api/bookings';
import { inr } from '../utils/format';

export default function Dashboard() {
  const { data } = useOrders();
  const { data: bookings } = useResourceOnce(listBookings);
  const orders = data || [];
  const active = orders.filter((o) => o.status === 'queue' || o.status === 'prep').length;
  const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0); // cancelled = no sale

  return (
    <>
      <div className="mh"><h2>Dashboard</h2></div>
      <div className="stats">
        <div><b>{orders.length}</b>Orders today</div>
        <div><b>{inr(revenue)}</b>Revenue</div>
        <div><b>{active}</b>Active queue</div>
        <div><b>{(bookings || []).length}</b>Bookings</div>
      </div>
      <h3 style={{ fontSize: 20, margin: '24px 0 10px' }}>Recent orders</h3>
      <DataTable head={['Token', 'Customer', 'Total', 'Status']} rows={orders.slice(-5).reverse().map((o) => [`#${o.no}`, o.name, inr(o.total), <StatusBadge status={o.status} />])} />
    </>
  );
}