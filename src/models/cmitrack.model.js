/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const { Schema, model } = require('mongoose');

const cmitrackSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    aicccontent: { type: Schema.Types.ObjectId, ref: 'AiccContent' },
    attempt: { type: Number, required: true, default: 1 },
    element: {
      type: String,
      required: true,
    },
    value: { type: String, required: true, default: '' },
  },
  { timestamps: true },
);

const CmiTrack = model('CMITrack', cmitrackSchema);

module.exports = CmiTrack;
