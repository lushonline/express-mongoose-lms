const get = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    res.redirect('/');
  });
};

module.exports = { get };
