const formidable = require('formidable');
const { isNil } = require('lodash');
const mongoose = require('mongoose');

const Parser = require('../../lib/aicc/parser');
const aiccutils = require('../../lib/aicc/util');
const { ObjectEncoding } = require('../../lib/utils/objectencoding');

const models = require('../../models');

const parser = new Parser();
const objectencoder = new ObjectEncoding();

const parseAiccRequest = (fields) => {
  parser.parseAICCData(fields.aicc_data || '');
  const response = parser.aiccdata;
  response.command = fields.command ? fields.command : null;
  response.version = fields.version ? fields.version : '2.2';
  response.sessionId = fields.session_id ? fields.session_id : null;
  return response;
};

const getCmiTracks = async (sessionId) => {
  const [sessionid, contentId] = sessionId.split('-');
  if (isNil(contentId) || isNil(sessionid)) {
    throw new Error('Invalid Session ID');
  }
  const { studentId, studentName, attempt = 1 } = objectencoder.decode(sessionid);

  const filter = {
    user: mongoose.Types.ObjectId(studentId),
    aicccontent: mongoose.Types.ObjectId(contentId),
    attempt,
  };

  const defaults = {
    'cmi.core.student_id': studentId,
    'cmi.core.student_name': studentName,
    'cmi.core.entry': 'ab-initio',
    'cmi.core.exit': '',
    'cmi.core.lesson_status': 'not attempted',
    'cmi.core.lesson_location': '',
    'cmi.core.credit': 'credit',
    'cmi.core.score.raw': '',
    'cmi.core.score.min': '0',
    'cmi.core.score.max': '100',
    'cmi.core.total_time': '00:00:00',
    'cmi.core.lesson_mode': 'normal',
    'cmi.suspend_data': '',
    'cmi.launch_data': '',
  };

  let obj = {};
  await models.CmiTrack.find(filter).then((cmitracks) => {
    obj = cmitracks.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue.element]: currentValue.value,
      };
    }, obj);
  });
  return { ...defaults, ...obj };
};

const formatCMITracks = (cmitracks) => {
  const score =
    cmitracks['cmi.core.score.raw'] !== ''
      ? `${cmitracks['cmi.core.score.raw']},${cmitracks['cmi.core.score.max']},${cmitracks['cmi.core.score.min']}`
      : '';

  const status =
    cmitracks['cmi.core.entry'] === ''
      ? `${cmitracks['cmi.core.lesson_status']}`
      : `${cmitracks['cmi.core.lesson_status']}, ${cmitracks['cmi.core.entry']}`;

  const items = [
    '[core]',
    `student_id=${cmitracks['cmi.core.student_id']}`,
    `student_name=${cmitracks['cmi.core.student_name']}`,
    `credit=${cmitracks['cmi.core.credit']}`,
    `lesson_location=${cmitracks['cmi.core.lesson_location']}`,
    `lesson_status=${status}`,
    `score=${score}`,
    `time=${cmitracks['cmi.core.total_time']}`,
    `lesson_mode=${cmitracks['cmi.core.lesson_mode']}`,
    '[Core_Lesson]',
    `${cmitracks['cmi.suspend_data']}`,
    '[Core_Vendor]',
    `${cmitracks['cmi.launch_data']}`,
  ];
  return items.join('\r\n');
};

const updateTotalTime = async (sessionId) => {
  const [sessionid, contentId] = sessionId.split('-');
  if (isNil(contentId) || isNil(sessionid)) {
    throw new Error('Invalid Session ID');
  }
  const { studentId, attempt = 1 } = objectencoder.decode(sessionid);

  const filter = {
    user: mongoose.Types.ObjectId(studentId),
    aicccontent: mongoose.Types.ObjectId(contentId),
    attempt,
  };

  const totalTime = await models.CmiTrack.findOne({
    ...filter,
    element: 'cmi.core.total_time',
  }).exec();

  const sessionTime = await models.CmiTrack.findOneAndDelete({
    ...filter,
    element: 'cmi.core.session_time',
  }).exec();

  const combined = aiccutils.addTimes(
    sessionTime ? sessionTime.value : '00:00:00',
    totalTime ? totalTime.value : '00:00:00',
  );

  const promises = [];

  promises.push(
    models.CmiTrack.updateOne(
      { ...filter, element: 'cmi.core.total_time' },
      {
        value: combined,
      },
      {
        upsert: true,
      },
    ).exec(),
  );

  return Promise.allSettled(promises);
};

const processGetParam = async (aiccrequest) => {
  let errorNumber = 0;
  let errorText = 'Successful';
  let aiccdata = null;
  const { version, sessionId } = aiccrequest;

  try {
    await updateTotalTime(sessionId);
    aiccdata = await getCmiTracks(sessionId).then((results) => {
      return formatCMITracks(results);
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

    const filter = {
      user: mongoose.Types.ObjectId(student.studentId),
      aicccontent: mongoose.Types.ObjectId(identifier),
      attempt: 1,
    };

    const promises = [];

    promises.push(
      models.CmiTrack.updateOne(
        { ...filter, element: 'cmi.core.lesson_status' },
        {
          value: aiccrequest.cmi.core.lesson_status
            ? aiccrequest.cmi.core.lesson_status
            : 'incomplete',
        },
        {
          upsert: true,
        },
      ).exec(),
    );

    promises.push(
      models.CmiTrack.updateOne(
        { ...filter, element: 'cmi.core.lesson_location' },
        {
          value: aiccrequest.cmi.core.lesson_location ? aiccrequest.cmi.core.lesson_location : '',
        },
        {
          upsert: true,
        },
      ).exec(),
    );

    promises.push(
      models.CmiTrack.updateOne(
        { ...filter, element: 'cmi.core.entry' },
        {
          $set: {
            value: '',
          },
        },
        {
          upsert: true,
        },
      ).exec(),
    );

    promises.push(
      models.CmiTrack.updateOne(
        { ...filter, element: 'cmi.core.score.raw' },
        {
          $set: {
            value: aiccrequest.cmi.core.score.raw ? aiccrequest.cmi.core.score.raw : '',
          },
        },
        {
          upsert: true,
        },
      ).exec(),
    );

    promises.push(
      models.CmiTrack.updateOne(
        { ...filter, element: 'cmi.core.session_time' },
        {
          $set: {
            value: aiccrequest.cmi.core.session_time
              ? aiccrequest.cmi.core.session_time
              : '00:00:00',
          },
        },
        {
          upsert: true,
        },
      ).exec(),
    );

    await Promise.allSettled(promises);
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
    await updateTotalTime(sessionId);
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
