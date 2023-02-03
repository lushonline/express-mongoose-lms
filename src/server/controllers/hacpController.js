const formidable = require('formidable');
const { isNil } = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

const { AiccParser } = require('../../lib/AiccParser');
const { ObjectEncoding } = require('../../lib/ObjectEncoding');

const models = require('../../models');

const parser = new AiccParser();
const objectencoder = new ObjectEncoding();
momentDurationFormatSetup(moment);

const parseAiccRequest = (fields) => {
  parser.stringToParse(fields.aicc_data || '');
  parser.parseAICCData();
  const response = parser.aiccdata;
  response.command = fields.command ? fields.command : null;
  response.version = fields.version ? fields.version : '2.2';
  response.sessionId = fields.session_id ? fields.session_id : null;
  return response;
};

const processGetParam = async (aiccrequest) => {
  let errorNumber = 0;
  let errorText = 'Successful';
  let aiccdata = null;
  const { version, sessionId } = aiccrequest;
  let student = null;

  try {
    const [sessionid, identifier] = sessionId.split('-');
    if (isNil(identifier) || isNil(sessionid)) {
      throw new Error('Invalid Session ID');
    }
    student = objectencoder.decode(sessionid);
    aiccdata = `[core]\r\nstudent_id=${student.studentId}\r\nstudent_name=${student.studentName}\r\ncredit=C\r\nlesson_location=\r\nlesson_status=not attempted, ab-initio\r\nscore=\r\ntime=00:00:00\r\nLesson_Mode=normal\r\n[Core_Lesson]\r\n[Core_Vendor]\r\n[Evaluation]\r\nCourse_ID=${identifier}`;

    const filter = {
      user: mongoose.Types.ObjectId(student.studentId),
      aicccontent: mongoose.Types.ObjectId(identifier),
    };

    await models.CmiData.findOne(filter).then((cmidata) => {
      if (cmidata) {
        const items = [
          '[core]',
          `student_id=${student.studentId}`,
          `student_name=${student.studentName}`,
          `credit=${cmidata.core.credit}`,
          `lesson_location=${cmidata.core.lesson_location}`,
          `lesson_status=${cmidata.core.lesson_status}`,
          `score=${cmidata.core.score.raw ? cmidata.core.score.raw : ''}`,
          `time=${cmidata.core.total_time}`,
          `lesson_mode=${cmidata.core.lesson_mode}`,
          '[Core_Lesson]',
          `${cmidata.suspend_data}`,
        ];

        aiccdata = items.join('\r\n');
      }
    });
  } catch (error) {
    errorNumber = 3;
    errorText = 'Invalid Session ID';
  }

  return `error=${errorNumber}\r\nerror_text=${errorText}\r\nversion=${version}${
    aiccdata ? `\r\naicc_data=${aiccdata}` : ''
  }`;
};

const processPutParam = async (aiccrequest) => {
  let errorNumber = 0;
  let errorText = 'Successful';
  const { version, sessionId } = aiccrequest;

  try {
    const [sessionid, identifier] = sessionId.split('-');
    if (isNil(identifier) || isNil(sessionid)) {
      throw new Error('Invalid Session ID');
    }
    const student = objectencoder.decode(sessionid);

    const cmidata = {
      'core.student_id': student.studentId,
      'core.student_name': student.studentName,
      'core.lesson_status': aiccrequest.cmi.core.lesson_status,
      'core.session_time': aiccrequest.cmi.core.session_time,
      'core.lesson_location': aiccrequest.cmi.core.lesson_location || '',
      'core.entry': '',
      exitau: false,
      martin: false,
    };

    if (aiccrequest.cmi.core.score.raw) {
      cmidata['core.score.raw'] = aiccrequest.cmi.core.score.raw || '';
    }

    const filter = {
      user: mongoose.Types.ObjectId(student.studentId),
      aicccontent: mongoose.Types.ObjectId(identifier),
    };

    const res = await models.CmiData.updateOne(
      filter,
      { $set: cmidata },
      {
        upsert: true,
      },
    );
    console.log(res);
  } catch (error) {
    errorNumber = 3;
    errorText = 'Invalid Session ID';
  }

  return `error=${errorNumber}\r\nerror_text=${errorText}\r\nversion=${version}}`;
};

const processExitAu = async (aiccrequest) => {
  let errorNumber = 0;
  let errorText = 'Successful';
  const { version, sessionId } = aiccrequest;

  try {
    const [sessionid, identifier] = sessionId.split('-');
    if (isNil(identifier) || isNil(sessionid)) {
      throw new Error('Invalid Session ID');
    }

    const student = objectencoder.decode(sessionid);

    const filter = {
      user: mongoose.Types.ObjectId(student.studentId),
      aicccontent: mongoose.Types.ObjectId(identifier),
    };

    // Find one adventure whose `country` is 'Croatia', otherwise `null`
    const doc = await models.CmiData.findOne(filter).exec();
    const sessionDuration = moment.duration(doc.core.session_time).asSeconds();
    const totalDuration = moment.duration(doc.core.total_time).asSeconds();

    const combined = moment
      .duration(sessionDuration + totalDuration, 'seconds')
      .format('hh:mm:ss', { trim: false });

    doc.exitau = true;
    doc.core.total_time = combined;

    const res = await doc.save();
    console.log(res);
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

  form.parse(req, async (err, fields) => {
    if (err) {
      next(err);
      return;
    }
    const aiccrequest = parseAiccRequest(fields);

    let response = '';

    switch (aiccrequest.command.toUpperCase()) {
      case 'GETPARAM':
        response = await processGetParam(aiccrequest);
        res.set('Content-Type', 'text/plain').render('hacpresponse', { response });
        break;
      case 'PUTPARAM':
        response = await processPutParam(aiccrequest);
        res.set('Content-Type', 'text/plain').render('hacpresponse', { response });
        break;
      case 'EXITAU':
        response = await processExitAu(aiccrequest);
        res.set('Content-Type', 'text/plain').render('hacpresponse', { response });
        break;
      case 'PUTCOMMENTS':
      case 'PUTOBJECTIVES':
      case 'PUTINTERACTIONS':
      case 'PUTPATH':
      case 'PUTPERFORMANCE':
        response = await processUnsupported(aiccrequest);
        res.set('Content-Type', 'text/plain').render('hacpresponse', { response });
        break;
      default:
        response = `error=1\r\nerror_text=Invalid_Command\r\nversion=${aiccrequest.version}}`;
        res.set('Content-Type', 'text/plain').render('hacpresponse', { response });
        break;
    }
  });
};

module.exports = { get, post };
