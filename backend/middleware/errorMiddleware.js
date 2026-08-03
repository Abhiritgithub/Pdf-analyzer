const { HttpError } = require('../utils/httpError');

function notFoundHandler(req, res, next) {
  next(new HttpError(404, `Route ${req.originalUrl} was not found.`));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Unexpected server error.' : err.message || 'Unexpected server error.';

  if (statusCode >= 500 && statusCode !== 503) {
    console.error(err);
  }

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
