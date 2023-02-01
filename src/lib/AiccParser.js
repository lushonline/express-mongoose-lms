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
      cmi: {},
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
        this.parsed.cmi.StudentID = this.value;
        break;
      case AiccConstants.STUDENT_NAME.toUpperCase():
        this.parsed.cmi.StudentName = this.value;
        break;
      case AiccConstants.LESSON_LOCATION.toUpperCase():
        this.parsed.cmi.LessonLocation = this.value;
        break;
      case AiccConstants.CREDIT.toUpperCase():
        this.parsed.cmi.Credit = this.value;
        break;
      case AiccConstants.LESSON_STATUS.toUpperCase():
        this.parsed.cmi.LessonStatus = this.value;
        break;
      case AiccConstants.SCORE.toUpperCase():
        this.parsed.cmi.Score = this.normalizeScore(this.value);
        break;
      case AiccConstants.TIME.toUpperCase():
        this.parsed.cmi.duration = this.value;
        break;
      default:
        response = false;
    }
    return response;
  }

  setAICCCoreLesson() {
    if (this.block != null && this.equalsIgnoreCase(this.block, AiccConstants.CORE_LESSON)) {
      this.parsed.cmi.CoreLesson = this.value;
      return true;
    }
    return false;
  }

  setAICCCoreVendor() {
    if (this.equalsIgnoreCase(this.key, AiccConstants.CORE_VENDOR)) {
      this.parsed.cmi.CoreVendor = this.value;
      return true;
    }
    return false;
  }

  setAICCComments() {
    if (this.equalsIgnoreCase(this.key, AiccConstants.COMMENTS)) {
      this.parsed.cmi.Comment = this.value;
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
        this.parsed.cessionId = this.value;
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

  setAICCStudentDemographics() {
    this.parsed.cmi.StudentDemographics = null;
    return false;
  }

  setAICCStudentPreferences() {
    this.parsed.cmi.StudentPreferences = null;
    return false;
  }

  setAICCStudentData() {
    this.parsed.cmi.StudentData = null;
    return false;
  }

  setAICCObjectivesStatus() {
    this.parsed.cmi.ObjectiveStatus = null;
    return false;
  }

  setAICCEvaluation() {
    this.parsed.cmi.Evaluation = null;
    return false;
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
        if (this.setAICCCoreLesson() || this.setAICCCoreVendor() || this.setAICCComments()) {
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
        if (
          this.setAICCHACPHeaderInformation() ||
          this.setAICCCore() ||
          this.setAICCCoreLesson() ||
          this.setAICCEvaluation() ||
          this.setAICCObjectivesStatus() ||
          this.setAICCStudentData() ||
          this.setAICCStudentDemographics() ||
          this.setAICCStudentPreferences()
        ) {
          continue;
        }
      }
    }
  }
}

module.exports = { AiccParser };
