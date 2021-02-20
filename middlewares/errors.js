const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  if (err.name === 'CastError') {
    message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  const errorContainer = err.errors
    ? Object.values(err.errors).map((data) => {
        return data.message.includes(
          'is not a valid enum value for path `role`'
        )
          ? (data.message = `${data.value} is not allowed, User and Publisher are the only acceptable roles`)
          : data.message;
      })
    : error.message;

  if (err.name === 'ValidationError') {
    const message = errorContainer;
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode,
    errors: [errorContainer] || 'Server Error',
  });
};

module.exports = errorHandler;
