export const inr = (n) => '₹' + n.toLocaleString('en-IN');

export const formatDateTime = (d = new Date()) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export const STATUS_LABEL = { queue: 'In Queue', prep: 'Preparing', ready: 'Ready', done: 'Completed' };
