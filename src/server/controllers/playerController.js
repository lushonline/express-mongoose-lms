const { AiccContent } = require('../../models');

const get = (req, res) => {
  const { id } = req.params;
  const aiccparameters = {
    aicc_sid: `${req.user.studentId}`,
    aicc_url: 'https://dummyaicc.azurewebsites.net/handler.aspx',
  };
  const item = AiccContent.findById(id) || [];
  res.render('player', { user: req.user, item, aiccparameters });
};

module.exports = { get };
