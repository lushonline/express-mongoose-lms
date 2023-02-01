const { INTERNAL_SERVER_ERROR } = require('http-status');
const ExtendableError = require('./ExtendableError');

/**
 * Class representing an Api error.
 * @extends ExtendableError
 */
class ApiError extends ExtendableError {
  /**
   * Creates an Api error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message, status = INTERNAL_SERVER_ERROR, isPublic = false) {
    super(message, status, isPublic);
  }
}

module.exports = ApiError;
