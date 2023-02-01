const { Schema, model } = require('mongoose');

const tokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  token: String,
  expires: Date,
  created: { type: Date, default: Date.now },
  createdByIp: String,
  revoked: Date,
  revokedByIp: String,
  replacedByToken: String,
});

tokenSchema.virtual('isExpired').get(() => {
  return Date.now() >= this.expires;
});

tokenSchema.virtual('isActive').get(() => {
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
