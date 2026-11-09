import { useCallback, useEffect, useState } from 'react';
import { getMenu } from '../api/menu';
import { getOrder, listOrders, subscribeToOrders } from '../api/orders';
import { cache } from './cache';

// Shows cached data instantly, fetches only on first visit, and (if live) refetches when an order changes.
function useResource(key, fetcher, live) {
  const [data, setData] = useState(() => cache.get(key)?.data ?? null);
  const [loading, setLoading] = useState(!cache.has(key));
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
    if (!c) load();                 // first visit only
    // Optional: for live pages, refresh quietly in the background (no loading flash).
    // Delete the next line if you want ZERO requests when returning to a page.
    else if (live) load();
    return live ? subscribeToOrders(load) : undefined;
  }, [key, live, load]);

  return { data, loading, error, reload: load };
}

export const useMenu = () => useResource('menu', getMenu, false);
export const useOrders = () => useResource('orders', listOrders, true);
export const useOrder = (id) => useResource(`order:${id}`, () => getOrder(id), true);
