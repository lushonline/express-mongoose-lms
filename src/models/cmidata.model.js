/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const { Schema, model } = require('mongoose');
const cmivalidators = require('../lib/cmi.validators');

const cmidataSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    aicccontent: { type: Schema.Types.ObjectId, ref: 'AiccContent' },
    core: {
      student_id: {
        type: String,
        validate: cmivalidators.IsCmiIdentifier,
      },
      student_name: {
        type: String,
        validate: cmivalidators.IsCmiString255,
      },
      lesson_location: {
        type: String,
        validate: cmivalidators.IsCmiString255,
        default: '',
      },
      credit: {
        type: String,
        validate: cmivalidators.IsCmiCredit,
        default: 'credit',
      },
      lesson_status: {
        type: String,
        validate: cmivalidators.IsCmiStatus,
        default: 'not attempted',
      },
      exit: {
        type: String,
        validate: cmivalidators.IsCmiExit,
      },
      entry: {
        type: String,
        validate: cmivalidators.IsCmiEntry,
        default: 'ab-initio',
      },
      score: {
        raw: {
          type: Number,
          validate: cmivalidators.IsCmiDecimal0To100OrBlank,
          default: '',
        },
        min: {
          type: Number,
          validate: cmivalidators.IsCmiDecimal0To100OrBlank,
          default: 0,
        },
        max: {
          type: Number,
          validate: cmivalidators.IsCmiDecimal0To100OrBlank,
          default: 100,
        },
      },
      session_time: {
        type: String,
        validate: cmivalidators.IsCmiTimespan,
        default: '0000:00:00',
      },
      total_time: {
        type: String,
        validate: cmivalidators.IsCmiTimespan,
        default: '0000:00:00',
      },
      lesson_mode: {
        type: String,
        validate: cmivalidators.IsCmiLessonMode,
        default: 'normal',
      },
    },
    suspend_data: {
      type: String,
      validate: cmivalidators.IsCmiString4096,
      default: '',
    },
    launch_data: {
      type: String,
      validate: cmivalidators.IsCmiString4096,
      default: '',
    },
    exitau: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const CmiData = model('CMI', cmidataSchema);

module.exports = CmiData;
