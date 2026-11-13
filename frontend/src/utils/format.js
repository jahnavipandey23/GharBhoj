export const inr = (n) => '₹' + n.toLocaleString('en-IN');

export const formatDateTime = (d = new Date()) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export const STATUS_LABEL = { queue: 'In Queue', prep: 'Preparing', ready: 'Ready', done: 'Completed', cancelled: 'Cancelled' };

// 125000 ms -> "2:05"
export const formatCountdown = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};