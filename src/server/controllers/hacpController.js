const formidable = require('formidable');
const { isNil } = require('lodash');
const { AiccParser } = require('../../lib/AiccParser');
const { ObjectEncoding } = require('../../lib/ObjectEncoding');

const parser = new AiccParser();
const objectencoder = new ObjectEncoding();

const parseAiccRequest = (fields) => {
  parser.stringToParse(fields.aicc_data || '');
  parser.parseAICCData();
  const response = parser.aiccdata;
  response.command = fields.command ? fields.command : null;
  response.version = fields.version ? fields.version : '2.2';
  response.sessionId = fields.session_id ? fields.session_id : null;
  return response;
};

const processGetParam = (aiccrequest) => {
  let errorNumber = 0;
  let errorText = 'Successful';
  let aiccdata = null;
  const { version, sessionId } = aiccrequest;
  let user = null;

  try {
    const [sessionid, identifier] = sessionId.split('-');
    if (isNil(identifier) || isNil(sessionid)) {
      throw new Error('Invalid Session ID');
    }
    user = objectencoder.decode(sessionid);
    aiccdata = `[core]\r\nstudent_id=${user.studentId}\r\nstudent_name=${user.studentName}\r\ncredit=C\r\nlesson_location=\r\nlesson_status=not attempted, ab-initio\r\nscore=\r\ntime=00:00:00\r\nLesson_Mode=normal\r\n[Core_Lesson]\r\n[Core_Vendor]\r\n[Evaluation]\r\nCourse_ID=${identifier}`;
  } catch (error) {
    errorNumber = 3;
    errorText = 'Invalid Session ID';
  }

  return `error=${errorNumber}\r\nerror_text=${errorText}\r\nversion=${version}${
    aiccdata ? `\r\naicc_data=${aiccdata}` : ''
  }`;
};

const processPutParam = (aiccrequest) => {
  let errorNumber = 0;
  let errorText = 'Successful';
  const { version, sessionId } = aiccrequest;

  try {
    const [sessionid, identifier] = sessionId.split('-');
    if (isNil(identifier) || isNil(sessionid)) {
      throw new Error('Invalid Session ID');
    }
  } catch (error) {
    errorNumber = 3;
    errorText = 'Invalid Session ID';
  }

  return `error=${errorNumber}\r\nerror_text=${errorText}\r\nversion=${version}}`;
};

const processExitAu = (aiccrequest) => {
  let errorNumber = 0;
  let errorText = 'Successful';
  const { version, sessionId } = aiccrequest;

  try {
    const [sessionid, identifier] = sessionId.split('-');
    if (isNil(identifier) || isNil(sessionid)) {
      throw new Error('Invalid Session ID');
    }
  } catch (error) {
    errorNumber = 3;
    errorText = 'Invalid Session ID';
  }

  return `error=${errorNumber}\r\nerror_text=${errorText}\r\nversion=${version}}`;
};

const processUnsupported = (aiccrequest) => {
  let errorNumber = 0;
  let errorText = 'Successful';
  const { version, sessionId } = aiccrequest;

  try {
    const [sessionid, identifier] = sessionId.split('-');
    if (isNil(identifier) || isNil(sessionid)) {
      throw new Error('Invalid Session ID');
    }
  } catch (error) {
    errorNumber = 3;
    errorText = 'Invalid Session ID';
  }

  return `error=${errorNumber}\r\nerror_text=${errorText}\r\nversion=${version}}`;
};

const get = (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.render('hacpresponse', null);
};

const post = (req, res, next) => {
  const form = formidable();

  form.parse(req, (err, fields) => {
    if (err) {
      next(err);
      return;
    }
    const aiccrequest = parseAiccRequest(fields);

    let response = '';

    switch (aiccrequest.command.toUpperCase()) {
      case 'GETPARAM':
        response = processGetParam(aiccrequest);
        break;
      case 'PUTPARAM':
        response = processPutParam(aiccrequest);
        break;
      case 'EXITAU':
        response = processExitAu(aiccrequest);
        break;
      case 'PUTCOMMENTS':
      case 'PUTOBJECTIVES':
      case 'PUTINTERACTIONS':
      case 'PUTPATH':
      case 'PUTPERFORMANCE':
        response = processUnsupported(aiccrequest);
        break;
      default:
        response = `error=1\r\nerror_text=Invalid_Command\r\nversion=${aiccrequest.version}}`;
        break;
    }

    res.set('Content-Type', 'text/plain').render('hacpresponse', { response });
  });
};

module.exports = { get, post };
