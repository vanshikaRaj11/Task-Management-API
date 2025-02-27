class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message); // Set the message for the Error object
    this.statusCode = statusCode;
    this.details = details; // Optional additional details
    Error.captureStackTrace(this, this.constructor); // Capture stack trace for debugging
  }
}

module.exports = ApiError;
