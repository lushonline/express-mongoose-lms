/* eslint-disable func-names */
const { Schema, model } = require('mongoose');

const tokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    token: String,
    expires: Date,
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

tokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expires;
});

tokenSchema.virtual('isActive').get(function () {
  return !this.revoked && !this.isExpired;
});

tokenSchema.methods.toJSON = () => {
  const tokenObj = this.toObject();
  delete tokenObj.user;
  delete tokenObj.id;
  // eslint-disable-next-line no-underscore-dangle
  delete tokenObj._id;
  return tokenObj;
};

const Token = model('Token', tokenSchema);

module.exports = Token;
