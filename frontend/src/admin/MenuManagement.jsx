import DataTable from '../components/DataTable';
import { useMenu } from '../hooks/useApi';
import { setDishAvailability } from '../api/menu';
import { inr } from '../utils/format';

export default function MenuManagement() {
  const { data, reload } = useMenu();
  const toggle = async (d) => { await setDishAvailability(d.id, !d.available); reload(); };
  return (
    <>
      <div className="mh"><h2>Menu Management</h2></div>
      <p className="note">Switch a dish off when it runs out. It shows as Sold out on the website.</p>
      <DataTable
        head={['Dish', 'Category', 'Price', 'Available']}
        rows={(data || []).map((d) => [d.name, d.category, inr(d.price), <button className={`btn sm ${d.available ? '' : 'o'}`} onClick={() => toggle(d)}>{d.available ? 'On' : 'Off'}</button>])}
      />
    </>
  );
}
