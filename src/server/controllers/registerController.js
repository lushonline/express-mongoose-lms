const formidable = require('formidable');
const { User } = require('../../models');

const get = (req, res) => {
  res.render('register', { error: null, user: null });
};

const post = (req, res, next) => {
  const form = formidable();
  form.parse(req, (err, fields) => {
    if (err) {
      next(err);
      return;
    }
    User.register(
      new User({
        username: fields.username,
        firstName: fields.firstName,
        familyName: fields.familyName,
      }),
      fields.password,
      (error) => {
        if (error) {
          res.render('register', { error, user: null });
        } else {
          res.redirect('/');
        }
      },
    );
  });
};

module.exports = { get, post };
