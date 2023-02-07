/**
 * The class allows an application to break a string into tokens.
 *
 * @class StringTokenizer
 */
class StringTokenizer {
  constructor(str, delim) {
    this.str = str;
    this.delimStr = delim;
    this.tokens = null;
    this.idx = -1;
    this.tokens = this.str.split(new RegExp(`[${this.delimStr}]+`, 'g'));
    if (this.tokens.length === 1 && this.tokens[0] === this.str) {
      this.tokens.pop();
    } else {
      if (this.tokens[0] === '') {
        this.tokens.shift();
      }
      if (this.tokens[this.tokens.length - 1] === '') {
        this.tokens.pop();
      }
    }
  }

  /**
   * This method tests if there are more tokens available from this tokenizer's string.
   *
   * @return {boolean}
   * @memberof StringTokenizer
   */
  hasMoreTokens() {
    return this.idx < this.tokens.length - 1;
  }

  /**
   * This method returns the next token from this string tokenizer.
   *
   * @return {*}
   * @memberof StringTokenizer
   */
  nextToken() {
    let token = null;
    if (this.idx < this.tokens.length - 1) {
      token = this.tokens[(this.idx += 1)];
    } else {
      throw new Error('Error in StringTokenizer.nextToken: index out of bounds');
    }
    return token;
  }

  /**
   * This method calculates the number of times that this tokenizer's nextToken method
   * can be called before it generates an exception.
   *
   * @return {integer}
   * @memberof StringTokenizer
   */
  countTokens() {
    return this.tokens.length - 1 - this.idx;
  }
}

module.exports = { StringTokenizer };
