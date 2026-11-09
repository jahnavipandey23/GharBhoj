import { useEffect, useState } from 'react';
import { cache } from './cache';

// Fetch once, remember the result. Shows saved data instantly when you come back to the page.
export function useResourceOnce(fetcher, key, maxAge = 30_000) {
  const hit = cache.get(key);
  const [data, setData] = useState(hit?.data ?? null);
  const [loading, setLoading] = useState(!hit);
  useEffect(() => {
    const c = cache.get(key);
    if (c && Date.now() - c.at < maxAge) return; // fresh enough: no request
    fetcher()
      .then((d) => { cache.set(key, { data: d, at: Date.now() }); setData(d); })
      .finally(() => setLoading(false));
  }, [key]); // eslint-disable-line
  return { data, loading };
}