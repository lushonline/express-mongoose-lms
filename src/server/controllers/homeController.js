const get = (req, res) => {
  res.render('home', { user: req.user });
};

module.exports = { get };
