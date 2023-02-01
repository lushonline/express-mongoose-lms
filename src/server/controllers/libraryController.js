const url = require('url');
const { AiccContent } = require('../../models');
const config = require('../../config/config');
const { ObjectEncoding } = require('../../lib/ObjectEncoding');

const objectencoder = new ObjectEncoding();

const getAbsoluteUrl = (req, relativeUrl) => {
  const host = req.header('Host');
  // eslint-disable-next-line no-unused-vars
  const [parsedHost, parsedPort] = host.split(':');
  let protocol = 'http';
  if (req.secure || req.protocol === 'https' || req.get('x-forwarded-proto') === 'https') {
    protocol = 'https';
  }

  const baseUrl = url.format({
    protocol,
    hostname: req.hostname,
    port: parsedPort,
  });
  return new URL(relativeUrl, baseUrl);
};

const get = (req, res) => {
  const studentObject = {
    studentId: req.user.studentId,
    studentName: `${req.user.lastName}, ${req.user.firstName}`,
  };

  const aiccparameters = {
    aicc_sid: objectencoder.encode(studentObject),
    aicc_url: config.onlinehacp
      ? 'https://dummyaicc.azurewebsites.net/handler.aspx'
      : getAbsoluteUrl(req, '/hacp'),
  };
  AiccContent.find({})
    .lean()
    .then((items) => {
      res.render('library', { user: req.user, items, aiccparameters });
    });
};

module.exports = { get };
