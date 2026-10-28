const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  cal: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-4 3-6 7-6s7 2 7 6" /><circle cx="17" cy="9" r="2.5" /></>,
  leaf: <path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8" />,
  box: <><rect x="4" y="8" width="16" height="12" rx="1" /><path d="M3 8l2-4h14l2 4" /></>,
  heart: <path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z" />,
  bell: <path d="M6 17V11a6 6 0 0112 0v6l2 2H4zM10 21h4" />,
  grid: <><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /></>,
  list: <path d="M5 6h14M5 12h14M5 18h14" />,
  edit: <path d="M4 20l4-1L19 8l-3-3L5 16zM14 7l3 3" />,
  chart: <path d="M5 20V10M12 20V4M19 20v-7" />,
  cog: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></>,
  out: <path d="M10 4H5v16h5M15 8l4 4-4 4M9 12h10" />,
  play: <path d="M8 5l11 7-11 7z" />,
  ok: <path d="M5 12l5 5 9-10" />,
  book: <path d="M5 4h10a4 4 0 014 4v12H9a4 4 0 01-4-4zM9 4v16" />,
  fork: <path d="M7 3v8M11 3v8M7 7h4M9 11v10M17 3c-2 2-2 6 0 8v10" />,
};

export default function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
