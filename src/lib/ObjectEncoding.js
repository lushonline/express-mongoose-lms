const basex = require('base-x');

class ObjectEncoding {
  constructor(alphabet = '0123456789abcdefghijklmnopqrstuvwxyz') {
    this.alphabet = alphabet;
    this.encoder = basex(this.alphabet);
  }

  encode(obj) {
    return this.encoder.encode(Buffer.from(JSON.stringify(obj)));
  }

  decode(str) {
    return JSON.parse(this.encoder.decode(str));
  }
}

module.exports = { ObjectEncoding };
