/* eslint-disable no-continue */
const { StringTokenizer } = require('./stringtokenizer');
const validators = require('./validators');

const models = require('../../models');

class Parser {
  constructor() {
    this.constants = {
      newline: '\r\n',
      equal_sign: '=',
      time_separator: ':',
      empty_string: '',
      command: 'command',
      version: 'version',
      session_id: 'session_id',
      au_password: 'au_password',
      error: 'error',
      error_text: 'error_text',
      core: '[core]',
      student_id: 'student_id',
      student_name: 'student_name',
      credit: 'credit',
      lesson_location: 'lesson_location',
      lesson_status: 'lesson_status',
      path: 'path',
      score: 'score',
      time: 'time',
      lesson_mode: 'lesson_mode',
      core_lesson: '[core_lesson]',
      core_vendor: '[core_vendor]',
      comments: '[comments]',
      evaluation: '[evaluation]',
      objectives_status: '[objectives_status]',
      student_data: '[student_data]',
      attempt_number: 'attempt_number',
      mastery_score: 'mastery_score',
      max_time_allowed: 'max_time_allowed',
      time_limit_action: 'time_limit_action',
      student_demographics: '[student_demographics]',
      student_preferences: '[student_preferences]',
    };

    this.key = '';
    this.value = null;
    this.block = null;
    this.bookmark = null;
    this.aiccdatastring = null;
    this.parsed = {
      cmi: new models.CmiData({}, {}, true).toObject(),
      command: null,
      sessionId: null,
      error: null,
      errorText: null,
      validationErrors: [],
    };

    this.equalsIgnoreCase = (str1, str2) => {
      return str1.toUpperCase() === str2.toUpperCase();
    };

    this.parseScore = (str = '') => {
      const scores = str.split(',', 3).map((value) => {
        return value.trim();
      });
      return {
        raw: scores[0] ? scores[0] : '',
        max: scores[1] ? scores[1] : '100',
        min: scores[2] ? scores[2] : '0',
      };
    };

    this.isValid = (val, validatorFn, message = 'Validation Error') => {
      if (validatorFn(val)) {
        return val;
      }
      this.parsed.validationErrors.push({ message, val });
      return null;
    };
  }

  get aiccdata() {
    return this.parsed;
  }

  setAICCCore() {
    let response = true;
    switch (this.key.toLowerCase()) {
      case this.constants.student_id:
        this.parsed.cmi.core.student_id = this.value;
        break;
      case this.constants.student_name:
        this.parsed.cmi.core.student_name = this.value;
        break;
      case this.constants.lesson_location:
        this.parsed.cmi.core.lesson_location = this.isValid(
          this.value,
          validators.IsCmiString255INI,
          `${this.key} is invalid`,
        );
        break;
      case this.constants.credit:
        this.parsed.cmi.core.credit = this.isValid(
          this.value,
          validators.IsCmiVocabularyCredit,
          `${this.key} is invalid`,
        );
        break;
      case this.constants.lesson_status:
        this.parsed.cmi.core.lesson_status = this.isValid(
          this.value,
          validators.IsCmiVocabularyINIStatus,
          `${this.key} is invalid`,
        );
        break;
      case this.constants.score: {
        const score = this.isValid(this.value, validators.IsCmiScore, `${this.key} is invalid`);
        this.parsed.cmi.core.score = this.parseScore(score);
        break;
      }
      case this.constants.time:
        this.parsed.cmi.core.session_time = this.isValid(
          this.value,
          validators.IsCmiTimespan,
          `${this.key} is invalid`,
        );
        break;
      default:
        response = false;
    }
    return response;
  }

  setAICCCoreLesson() {
    if (this.block != null && this.equalsIgnoreCase(this.block, this.constants.core_lesson)) {
      this.parsed.cmi.suspend_data = this.isValid(
        this.value,
        validators.IsCmiString4096INI,
        `${this.key} is invalid`,
      );
      return true;
    }
    return false;
  }

  setAICCCoreVendor() {
    if (this.equalsIgnoreCase(this.key, this.constants.core_vendor)) {
      this.parsed.cmi.launch_data = this.isValid(
        this.value,
        validators.IsCmiString4096INI,
        `${this.key} is invalid`,
      );
      return true;
    }
    return false;
  }

  setAICCHACPHeaderInformation() {
    let response = true;
    switch (this.key.toLowerCase()) {
      case this.constants.command:
        this.parsed.command = this.value;
        break;
      case this.constants.session_id:
        this.parsed.sessionId = this.value;
        break;
      case this.constants.error:
        this.parsed.error = this.value;
        break;
      case this.constants.error_text:
        this.parsed.errorText = this.value;
        break;
      default:
        response = false;
    }
    return response;
  }

  parseAICCData(str) {
    this.aiccdatastring = str || '';
    const c = new StringTokenizer(this.aiccdatastring, this.constants.newline);
    let b = '';
    while (c.hasMoreTokens()) {
      if (!b.startsWith('[')) {
        b = c.nextToken().trim();
      }
      if (b === this.constants.empty_string) {
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
      if (b.startsWith('<') || b.indexOf(this.constants.equal_sign) === -1) {
        if (b.startsWith('[') || b === '') {
          continue;
        } else {
          this.value = b;
        }
        if (this.setAICCCoreLesson() || this.setAICCCoreVendor()) {
          continue;
        }
      } else {
        const d = new StringTokenizer(b, this.constants.equal_sign);
        if (d.hasMoreTokens()) {
          this.key = d.nextToken().trim();
        } else {
          this.key = this.constants.empty_string;
        }
        if (d.hasMoreTokens()) {
          this.value = d.nextToken().trim();
        } else {
          this.value = this.constants.empty_string;
        }
        if (this.value === this.constants.empty_string) {
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

module.exports = Parser;
