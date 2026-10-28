import { useEffect, useState } from 'react';

// Fetch something once when the page opens (no live updates).
export function useResourceOnce(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetcher().then(setData).finally(() => setLoading(false)); }, []); // eslint-disable-line
  return { data, loading };
}
