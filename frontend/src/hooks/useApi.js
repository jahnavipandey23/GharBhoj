import { useCallback, useEffect, useState } from 'react';
import { getMenu } from '../api/menu';
import { getOrder, listOrders, subscribeToOrders } from '../api/orders';
import { cache } from './cache';

// Shows cached data instantly. Live resources (orders) also refetch when the server says an order changed,
// and every 15 seconds as a backup in case the live connection drops.
function useResource(key, fetcher, live) {
  const [data, setData] = useState(() => cache.get(key)?.data ?? null);
  const [loading, setLoading] = useState(() => !cache.get(key));
  const [error, setError] = useState(null);

  const load = useCallback(
    () => fetcher()
      .then((d) => { cache.set(key, { data: d, at: Date.now() }); setData(d); setError(null); })
      .catch(setError)
      .finally(() => setLoading(false)),
    [key] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const c = cache.get(key);
    setData(c?.data ?? null);
    setLoading(!c);
    if (!c || live) load(); // first visit, or live data: always refresh quietly

    if (!live) return undefined;
    const unsubscribe = subscribeToOrders(load);
    const timer = setInterval(() => { if (!document.hidden) load(); }, 15_000); // backup refresh
    return () => { unsubscribe(); clearInterval(timer); };
  }, [key, live, load]);

  return { data, loading, error, reload: load };
}

export const useMenu = () => useResource('menu', getMenu, false);
export const useOrders = () => useResource('orders', listOrders, true);
export const useOrder = (id) => useResource(`order:${id}`, () => getOrder(id), true);