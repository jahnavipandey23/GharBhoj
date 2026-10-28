import DataTable from '../components/DataTable';
import { useResourceOnce } from '../hooks/useOnce';
import { getCustomers } from '../api/admin';
import { inr } from '../utils/format';

export default function Customers() {
  const { data } = useResourceOnce(getCustomers);
  return (
    <>
      <div className="mh"><h2>Customers</h2></div>
      <DataTable head={['Name', 'Orders', 'Spent']} rows={(data || []).map((c) => [c.name, c.orders, inr(c.spent)])} />
    </>
  );
}
