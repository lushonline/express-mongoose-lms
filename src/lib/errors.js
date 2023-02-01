const generaterr = require('generaterr');

const ValidationError = generaterr('ValidationError');

const InvalidUsernameError = generaterr('InvalidUsernameError', null, {
  inherits: ValidationError,
});
const InvalidPasswordError = generaterr('InvalidPasswordError', null, {
  inherits: ValidationError,
});

module.exports = { ValidationError, InvalidUsernameError, InvalidPasswordError };
