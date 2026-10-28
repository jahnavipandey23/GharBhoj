// Our own error type: throw new HttpError(400, 'Name is required') anywhere in a route.
export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Express does not catch errors from async functions by itself. This wrapper does.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// One place that turns any error into a clean JSON reply: { message: "..." }
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err.name === 'CastError') err = new HttpError(400, 'Invalid id');
  if (err.name === 'ValidationError') err = new HttpError(400, err.message);
  const status = err.status || 500;
  if (status === 500) console.error(err); // real bugs are logged, never shown to customers
  res.status(status).json({ message: status === 500 ? 'Something went wrong on the server' : err.message });
}
