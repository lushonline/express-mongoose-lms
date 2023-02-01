const { Schema, model } = require('mongoose');

const IsCmiString255 = (str) => {
  return str.length <= 255;
};

const IsCmiString4096 = (str) => {
  return str.length <= 4096;
};

const IsCmiIdentifier = (str) => {
  if (str.length > 255) return false;
  return str.search(/^[A-Za-z0-9\-_:]+$/) !== -1;
};

const IsCmiCredit = (str) => {
  return str === 'credit' || str === 'no-credit';
};

const IsCmiStatus = (str) => {
  return str.search(/^(passed|completed|failed|incomplete|browsed|not attempted)$/) !== -1;
};

const IsCmiLessonMode = (str) => {
  return str.search(/^(browse|normal|review)$/) !== -1;
};

const IsCmiEntry = (str) => {
  return str === 'ab-initio' || str === 'resume' || str === '';
};

const IsCmiExit = (str) => {
  return str === 'time-out' || str === 'suspend' || str === 'logout' || str === '';
};

const IsCmiTimespan = (str) => {
  // HHHH:MM:SS.SS
  // Hour: 2-4 digits. The decimal part of seconds is optional (0-2 digits).
  return str.search(/^\d{2,4}:\d\d:\d\d(\.\d{1,2})?$/) !== -1;
};

const IsCmiDecimal = (str) => {
  return str.search(/\d+/) !== -1 && str.search(/^[-+]?((0*)|([1-9]\d*))(\.\d+)?$/) !== -1;
};

const IsCmiDecimal0To100OrBlank = (val) => {
  if (typeof val === 'undefined' || val === null) return true;
  const check = String(val);
  if (check === '') return true;
  if (!IsCmiDecimal(check)) return false;
  const num = parseFloat(check);
  return num >= 0 && num <= 100;
};

const cmiSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    core: {
      student_id: {
        type: String,
        validate: IsCmiIdentifier,
      },
      student_name: {
        type: String,
        validate: IsCmiString255,
      },
      lesson_location: {
        type: String,
        validate: IsCmiString255,
        default: '',
      },
      credit: {
        type: String,
        validate: IsCmiCredit,
        default: 'credit',
      },
      lesson_status: {
        type: String,
        validate: IsCmiStatus,
        default: 'not attempted',
      },
      exit: {
        type: String,
        validate: IsCmiExit,
      },
      entry: {
        type: String,
        validate: IsCmiEntry,
        default: 'ab-initio',
      },
      score: {
        raw: {
          type: Number,
          validate: IsCmiDecimal0To100OrBlank,
          default: '',
        },
        min: {
          type: Number,
          validate: IsCmiDecimal0To100OrBlank,
          default: 0,
        },
        max: {
          type: Number,
          validate: IsCmiDecimal0To100OrBlank,
          default: 100,
        },
      },
      session_time: {
        type: String,
        validate: IsCmiTimespan,
        default: '0000:00:00',
      },
      total_time: {
        type: String,
        validate: IsCmiTimespan,
        default: '0000:00:00',
      },
      lesson_mode: {
        type: String,
        validate: IsCmiLessonMode,
        default: 'normal',
      },
    },
    suspend_data: {
      type: String,
      validate: IsCmiString4096,
      default: '',
    },
    launch_data: {
      type: String,
      validate: IsCmiString4096,
      default: '',
    },
  },
  { timestamps: true },
);

const CmiData = model('CMI', cmiSchema);

module.exports = CmiData;
