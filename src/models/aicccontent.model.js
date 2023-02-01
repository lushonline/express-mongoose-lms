const { Schema, model } = require('mongoose');
const { isURL } = require('validator');

const aicccontentSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    launchurl: {
      type: String,
      validate: [isURL],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

aicccontentSchema.methods.toJSON = () => {
  return this.toObject();
};

const AiccContent = model('AiccContent', aicccontentSchema);

module.exports = AiccContent;
