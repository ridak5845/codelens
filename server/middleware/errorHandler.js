// Centralized fallback error handler. Catches anything that reaches Express without
// being handled by a route's own try/catch — ensures the client always gets clean JSON,
// never a raw stack trace or an HTML error page, regardless of environment.
function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err.stack || err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    error: 'Something went wrong on our end. Please try again.'
  });
}

module.exports = errorHandler;