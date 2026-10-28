import DataTable from '../components/DataTable';
import { useResourceOnce } from '../hooks/useOnce';
import { listBookings } from '../api/bookings';

export default function Bookings() {
  const { data } = useResourceOnce(listBookings);
  return (
    <>
      <div className="mh"><h2>Table Bookings</h2></div>
      <p className="note">New bookings from the website appear here.</p>
      <DataTable head={['Ref', 'Name', 'Guests', 'Date', 'Time']} rows={(data || []).map((b) => [b.ref, b.name, b.guests, new Date(b.date + 'T12:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), b.time])} />
    </>
  );
}
