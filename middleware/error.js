const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500; // Default to 500 if statusCode is not set
  const message = err.message || "Internal Server Error"; // Default message

  console.error(`[ERROR] ${statusCode} - ${message}`); // Log error for debugging

  res.status(statusCode).json({
    success: false,
    code: statusCode,
    message,
    ...(err.details && { details: err.details }), // Include details if provided
  });
};

module.exports = errorHandler;
