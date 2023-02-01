const get = (req, res) => {
  res.redirect('/');
};

const post = (req, res) => {
  res.redirect('/library');
};

module.exports = { get, post };
