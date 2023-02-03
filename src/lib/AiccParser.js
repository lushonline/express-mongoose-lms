/* eslint-disable no-continue */
const { AiccConstants } = require('./AiccConstants');
const { StringTokenizer } = require('./StringTokenizer');

class AiccParser {
  constructor() {
    this.key = '';
    this.value = null;
    this.block = null;
    this.bookmark = null;
    this.aiccdatastring = null;
    this.parsed = {
      cmi: { core: { score: {} }, suspend_data: '', launch_data: '' },
      command: null,
      sessionId: null,
      error: null,
      errorText: null,
    };
    this.equalsIgnoreCase = (str1, str2) => {
      return str1.toUpperCase() === str2.toUpperCase();
    };
    this.normalizeScore = (str = null) => {
      let score = null;
      if (str && str.indexOf(',') !== -1) {
        score = str.substring(0, str.indexOf(',')).trim();
      }
      return score ? parseFloat(score) : null;
    };
  }

  get aiccdata() {
    return this.parsed;
  }

  stringToParse(str) {
    this.aiccdatastring = str;
  }

  setAICCCore() {
    let response = true;
    switch (this.key.toUpperCase()) {
      case AiccConstants.STUDENT_ID.toUpperCase():
        this.parsed.cmi.core.student_id = this.value;
        break;
      case AiccConstants.STUDENT_NAME.toUpperCase():
        this.parsed.cmi.core.student_name = this.value;
        break;
      case AiccConstants.LESSON_LOCATION.toUpperCase():
        this.parsed.cmi.core.lesson_location = this.value;
        break;
      case AiccConstants.CREDIT.toUpperCase():
        this.parsed.cmi.core.credit = this.value;
        break;
      case AiccConstants.LESSON_STATUS.toUpperCase():
        this.parsed.cmi.core.lesson_status = this.value;
        break;
      case AiccConstants.SCORE.toUpperCase(): {
        const score = this.normalizeScore(this.value);
        if (score) {
          this.parsed.cmi.core.score.raw = score;
        }
        break;
      }
      case AiccConstants.TIME.toUpperCase():
        this.parsed.cmi.core.session_time = this.value;
        break;
      default:
        response = false;
    }
    return response;
  }

  setAICCCoreLesson() {
    if (this.block != null && this.equalsIgnoreCase(this.block, AiccConstants.CORE_LESSON)) {
      this.parsed.cmi.suspend_data = this.value;
      return true;
    }
    return false;
  }

  setAICCCoreVendor() {
    if (this.equalsIgnoreCase(this.key, AiccConstants.CORE_VENDOR)) {
      this.parsed.cmi.launch_data = this.value;
      return true;
    }
    return false;
  }

  setAICCHACPHeaderInformation() {
    let response = true;
    switch (this.key.toUpperCase()) {
      case AiccConstants.COMMAND.toUpperCase():
        this.parsed.command = this.value;
        break;
      case AiccConstants.SESSION_ID.toUpperCase():
        this.parsed.sessionId = this.value;
        break;
      case AiccConstants.ERROR.toUpperCase():
        this.parsed.error = this.value;
        break;
      case AiccConstants.ERROR_TEXT.toUpperCase():
        this.parsed.errorText = this.value;
        break;
      default:
        response = false;
    }
    return response;
  }

  parseAICCData() {
    const c = new StringTokenizer(this.aiccdatastring, AiccConstants.NEWLINE);
    let b = '';
    while (c.hasMoreTokens()) {
      if (!b.startsWith('[')) {
        b = c.nextToken().trim();
      }
      if (b === AiccConstants.EMPTY_STRING) {
        continue;
      }
      if (b.startsWith('[')) {
        this.key = b;
        this.block = b;
        if (c.hasMoreTokens()) {
          b = c.nextToken().trim();
        } else {
          return;
        }
      }
      if (b.startsWith('<') || b.indexOf(AiccConstants.EQUAL_SIGN) === -1) {
        if (b.startsWith('[') || b === '') {
          continue;
        } else {
          this.value = b;
        }
        if (this.setAICCCoreLesson() || this.setAICCCoreVendor()) {
          continue;
        }
      } else {
        const d = new StringTokenizer(b, AiccConstants.EQUAL_SIGN);
        if (d.hasMoreTokens()) {
          this.key = d.nextToken().trim();
        } else {
          this.key = AiccConstants.EMPTY_STRING;
        }
        if (d.hasMoreTokens()) {
          this.value = d.nextToken().trim();
        } else {
          this.value = AiccConstants.EMPTY_STRING;
        }
        if (this.value === AiccConstants.EMPTY_STRING) {
          this.value = null;
        }
        if (
          this.key != null &&
          this.equalsIgnoreCase(this.key, 'aicc_data') &&
          this.value != null &&
          this.value.startsWith('[')
        ) {
          b = this.value;
        }
        if (this.setAICCHACPHeaderInformation() || this.setAICCCore() || this.setAICCCoreLesson()) {
          continue;
        }
      }
    }
  }
}

module.exports = { AiccParser };
