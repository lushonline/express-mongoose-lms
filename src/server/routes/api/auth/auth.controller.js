const { sign } = require('jsonwebtoken');
const { INTERNAL_SERVER_ERROR, UNAUTHORIZED, FORBIDDEN } = require('http-status');
const { authenticate } = require('passport');
const APIError = require('../../../helpers/ApiError');
const config = require('../../../../config/config');
const { User } = require('../../../../models');

const generateJwtToken = (user, JwtSecret) => {
  // create a jwt token containing the user id that expires in 60 minutes
  return sign({ sub: user.id, id: user.id }, JwtSecret, { expiresIn: '60m' });
};

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  authenticate('login', (err, users, info) => {
    if (err) {
      next(new APIError('Error', INTERNAL_SERVER_ERROR, true));
    }
    if (info !== undefined) {
      if (info.message === 'bad username') {
        next(new APIError(info.message, UNAUTHORIZED, true));
      } else {
        next(new APIError(info.message, FORBIDDEN, true));
      }
    } else {
      req.logIn(users, () => {
        User.findOne({
          where: {
            userName: req.body.username,
          },
        }).then((user) => {
          const token = generateJwtToken(user, config.JwtSecret);

          res.status(200).send({
            auth: true,
            token,
            message: 'user found & logged in',
          });
        });
      });
    }
  })(req, res, next);
}

module.exports = {
  login,
};
