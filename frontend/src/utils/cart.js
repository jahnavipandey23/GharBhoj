// Turns the cart ({ dishId: quantity }) plus the menu into lines and totals.
// This is only for showing prices. The server must recalculate them on POST /orders.
export function summarize(menu, items) {
  const lines = menu.filter((d) => items[d.id]).map((d) => ({ ...d, quantity: items[d.id] }));
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const gst = Math.round(subtotal * 0.05);
  return { lines, subtotal, gst, total: subtotal + gst };
}
