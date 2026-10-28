import { useCallback, useEffect, useState } from 'react';
import { getMenu } from '../api/menu';
import { getOrder, listOrders, subscribeToOrders } from '../api/orders';

// Runs `fetcher`, tracks loading/error, and (if live) refetches whenever an order changes.
function useResource(fetcher, deps, live) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    () => fetcher().then((d) => { setData(d); setError(null); }).catch(setError).finally(() => setLoading(false)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(() => {
    load();
    return live ? subscribeToOrders(load) : undefined;
  }, [load, live]);

  return { data, loading, error, reload: load };
}

export const useMenu = () => useResource(getMenu, [], false);
export const useOrders = () => useResource(listOrders, [], true);
export const useOrder = (id) => useResource(() => getOrder(id), [id], true);
