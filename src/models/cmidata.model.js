/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const { Schema, model } = require('mongoose');
const cmivalidators = require('../lib/aicc/validators');

const cmidataSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    aicccontent: { type: Schema.Types.ObjectId, ref: 'AiccContent' },
    core: {
      student_id: {
        type: String,
        validate: cmivalidators.IsCmiIdentifierINI,
      },
      student_name: {
        type: String,
        validate: cmivalidators.IsCmiString255INI,
      },
      lesson_location: {
        type: String,
        validate: cmivalidators.IsCmiString255INI,
        default: '',
      },
      credit: {
        type: String,
        validate: cmivalidators.IsCmiVocabularyCredit,
        default: 'credit',
      },
      lesson_status: {
        type: String,
        validate: cmivalidators.IsCmiVocabularyINIStatus,
        default: 'not attempted',
      },
      exit: {
        type: String,
        validate: cmivalidators.IsCmiVocabularyExit,
      },
      entry: {
        type: String,
        validate: cmivalidators.IsCmiVocabularyEntry,
        default: 'ab-initio',
      },
      score: {
        raw: {
          type: String,
          validate: cmivalidators.IsCmiDecimal,
          default: '',
        },
        min: {
          type: String,
          validate: cmivalidators.IsCmiDecimal,
          default: '0',
        },
        max: {
          type: String,
          validate: cmivalidators.IsCmiDecimal,
          default: '100',
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
        validate: cmivalidators.IsCmiVocabularyINIMode,
        default: 'normal',
      },
    },
    suspend_data: {
      type: String,
      validate: cmivalidators.IsCmiString4096INI,
      default: '',
    },
    launch_data: {
      type: String,
      validate: cmivalidators.IsCmiString4096INI,
      default: '',
    },
    exitau: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const CmiData = model('CMI', cmidataSchema);

module.exports = CmiData;
