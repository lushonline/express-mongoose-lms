const { AiccContent } = require('../../models');
const { ObjectEncoding } = require('../../lib/ObjectEncoding');

const objectencoder = new ObjectEncoding();

const get = (req, res) => {
  const { id } = req.params;

  const studentObject = {
    studentId: req.user.student_id,
    studentName: req.user.student_name,
  };

  const aiccparameters = {
    aicc_sid: objectencoder.encode(studentObject),
    aicc_url: 'https://dummyaicc.azurewebsites.net/handler.aspx',
  };
  const item = AiccContent.findById(id) || [];
  res.render('player', { user: req.user, item, aiccparameters });
};

module.exports = { get };
