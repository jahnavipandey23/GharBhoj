import { useState } from 'react';
import Icon from '../components/Icon';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useOrders } from '../hooks/useApi';
import { setOrderStatus } from '../api/orders';
import { formatDateTime, inr } from '../utils/format';

const TABS = [['active', 'Active Queue'], ['prep', 'Preparing'], ['ready', 'Ready'], ['done', 'Completed']];

export default function OrdersQueue() {
  const { data, reload } = useOrders(); // live: updates when any order changes
  const [tab, setTab] = useState('active');
  const orders = data || [];
  const count = (s) => orders.filter((o) => o.status === s).length;
  const tabCount = { active: count('queue') + count('prep'), prep: count('prep'), ready: count('ready'), done: null };
  const shown = orders.filter((o) => (tab === 'active' ? o.status === 'queue' || o.status === 'prep' : o.status === tab));

  const move = async (id, status) => { await setOrderStatus(id, status); reload(); };
  const action = (o) => {
    if (o.status === 'queue') return <button className="btn sm" onClick={() => move(o.id, 'prep')}><Icon name="play" size={12} /> Start</button>;
    if (o.status === 'prep') return <button className="btn o sm" style={{ color: 'var(--mr)', borderColor: 'var(--mr)' }} onClick={() => move(o.id, 'ready')}><Icon name="ok" size={12} /> Mark Ready</button>;
    if (o.status === 'ready') return <button className="btn o sm" onClick={() => move(o.id, 'done')}>Complete</button>;
    return null;
  };

  return (
    <>
      <div className="mh">
        <h2>Orders &amp; Queue</h2><span className="live">● Live</span>
        <div className="sp">
          <span style={{ position: 'relative' }}><Icon name="bell" size={20} /><i style={{ position: 'absolute', top: -1, right: 0, width: 7, height: 7, borderRadius: '50%', background: '#D33' }} /></span>
          <span className="chipd">{formatDateTime()}</span>
        </div>
      </div>
      <div className="ut">
        {TABS.map(([key, label]) => (
          <button key={key} className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>
            {label}{tabCount[key] !== null ? ` (${tabCount[key]})` : ''}
          </button>
        ))}
      </div>
      <DataTable
        head={['#', 'Order ID', 'Customer', 'Items', 'Total', 'Status', 'Actions']}
      rows={shown.map((o) => [o.queuePosition ?? o.no, o.id, o.name, `${o.items} items`, inr(o.total), <StatusBadge status={o.status} />, action(o)])}
      />
      <div className="stats">
        <div><b>{count('queue')}</b>In Queue</div>
        <div><b>{count('prep')}</b>Preparing</div>
        <div><b>{count('ready')}</b>Ready</div>
        <div><b>{count('done')}</b>Completed Today</div>
      </div>
    </>
  );
}
