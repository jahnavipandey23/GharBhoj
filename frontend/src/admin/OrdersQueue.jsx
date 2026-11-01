import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useOrders } from '../hooks/useApi';
import { setOrderStatus } from '../api/orders';
import { formatDateTime, inr } from '../utils/format';

const TABS = [
  ['active', 'Active Queue'],
  ['prep', 'Preparing'],
  ['ready', 'Ready'],
  ['done', 'Completed'],
];

const STORAGE_KEY = 'gb_admin_notifications';

const STATUS_LABEL = {
  queue: 'In Queue',
  prep: 'Preparing',
  ready: 'Ready',
  done: 'Completed',
};

function readNotifications() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function OrdersQueue() {
  const { data, reload } = useOrders();
  const [tab, setTab] = useState('active');
  const [notifications, setNotifications] = useState(readNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const previousOrders = useRef(null);

  const orders = data || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Persist notifications so they remain visible after navigating or reloading.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // The queue should continue working even if browser storage is unavailable.
    }
  }, [notifications]);

  // useOrders refetches on Socket.IO order updates.
  // Compare successive results to detect new orders and status changes.
  useEffect(() => {
    if (!Array.isArray(data)) return;

    const current = new Map(
      data.map((order) => [
        order.id,
        {
          id: order.id,
          no: order.no,
          name: order.name,
          status: order.status,
        },
      ])
    );

    // The first response establishes a baseline; don't notify about old orders.
    if (previousOrders.current === null) {
      previousOrders.current = current;
      return;
    }

    const previous = previousOrders.current;
    previousOrders.current = current;

    const created = [];

    for (const [id, order] of current) {
      const oldOrder = previous.get(id);
      let title = '';
      let message = '';

      if (!oldOrder) {
        title = 'New order received';
        message = `Order #${order.no} from ${order.name}`;
      } else if (oldOrder.status !== order.status) {
        title = 'Order status updated';
        message = `Order #${order.no} (${order.name}) is now ${
          STATUS_LABEL[order.status] || order.status
        }.`;
      }

      if (title) {
        created.push({
          key: `${id}-${order.status}-${Date.now()}-${created.length}`,
          title,
          message,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    }

    if (created.length) {
      setNotifications((previousNotifications) =>
        [...created.reverse(), ...previousNotifications].slice(0, 30)
      );
    }
  }, [data]);

  const count = (status) =>
    orders.filter((order) => order.status === status).length;

  const tabCount = {
    active: count('queue') + count('prep'),
    prep: count('prep'),
    ready: count('ready'),
    done: null,
  };

  const shown = orders.filter((order) =>
    tab === 'active'
      ? order.status === 'queue' || order.status === 'prep'
      : order.status === tab
  );

  const move = async (id, status) => {
    setActionError('');

    try {
      await setOrderStatus(id, status);
      await reload();
    } catch (error) {
      setActionError(error.message || 'Could not update the order status.');
    }
  };

  const action = (order) => {
    if (order.status === 'queue') {
      return (
        <button className="btn sm" onClick={() => move(order.id, 'prep')}>
          <Icon name="play" size={12} /> Start
        </button>
      );
    }

    if (order.status === 'prep') {
      return (
        <button
          className="btn o sm"
          style={{ color: 'var(--mr)', borderColor: 'var(--mr)' }}
          onClick={() => move(order.id, 'ready')}
        >
          <Icon name="ok" size={12} /> Mark Ready
        </button>
      );
    }

    if (order.status === 'ready') {
      return (
        <button className="btn o sm" onClick={() => move(order.id, 'done')}>
          Complete
        </button>
      );
    }

    return null;
  };

  const markAllRead = () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <>
      <div className="mh">
        <h2>Orders &amp; Queue</h2>
        <span className="live">● Live</span>

        <div className="sp">
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 0,
                background: 'transparent',
                color: 'inherit',
                padding: 6,
                cursor: 'pointer',
              }}
            >
              <Icon name="bell" size={20} />

              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -3,
                    minWidth: 16,
                    height: 16,
                    padding: '0 3px',
                    borderRadius: 10,
                    background: '#D33',
                    color: '#fff',
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 36,
                  right: 0,
                  width: 320,
                  maxWidth: '80vw',
                  maxHeight: 420,
                  overflowY: 'auto',
                  zIndex: 100,
                  padding: 14,
                  background: 'var(--bg, #fffaf4)',
                  color: 'var(--tx, #301718)',
                  border: '1px solid var(--line, #e8d7c4)',
                  borderRadius: 12,
                  boxShadow: '0 12px 35px rgba(30,0,0,.16)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <strong>Notifications</strong>
                  <button
                    type="button"
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                    style={{
                      border: 0,
                      background: 'transparent',
                      cursor: unreadCount ? 'pointer' : 'default',
                      color: 'var(--mr)',
                      fontSize: 12,
                    }}
                  >
                    Mark all read
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="note">No notifications yet. New orders will appear here.</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.key}
                      style={{
                        padding: '10px 0',
                        borderTop: '1px solid var(--line, #e8d7c4)',
                        opacity: notification.read ? 0.72 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
                        {!notification.read && (
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              minWidth: 7,
                              marginTop: 5,
                              borderRadius: '50%',
                              background: '#D33',
                            }}
                          />
                        )}
                        <div>
                          <strong style={{ fontSize: 13 }}>{notification.title}</strong>
                          <p style={{ margin: '4px 0', fontSize: 12 }}>
                            {notification.message}
                          </p>
                          <span className="note" style={{ fontSize: 11 }}>
                            {new Date(notification.createdAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="btn o sm"
                    style={{ marginTop: 10, width: '100%' }}
                    onClick={clearNotifications}
                  >
                    Clear notifications
                  </button>
                )}
              </div>
            )}
          </div>

          <span className="chipd">{formatDateTime()}</span>
        </div>
      </div>

      {actionError && (
        <p className="note" role="alert" style={{ color: '#b42318', margin: '8px 0' }}>
          {actionError}
        </p>
      )}

      <div className="ut">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? 'on' : ''}
            onClick={() => setTab(key)}
          >
            {label}
            {tabCount[key] !== null ? ` (${tabCount[key]})` : ''}
          </button>
        ))}
      </div>

      <DataTable
        head={['#', 'Order ID', 'Customer', 'Items', 'Total', 'Status', 'Actions']}
        rows={shown.map((order) => [
          order.queuePosition ?? order.no,
          order.id,
          order.name,
          `${order.items} items`,
          inr(order.total),
          <StatusBadge status={order.status} />,
          action(order),
        ])}
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
