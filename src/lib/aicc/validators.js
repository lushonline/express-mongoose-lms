/* eslint-disable no-control-regex */
/* eslint-disable no-useless-escape */
/* BNF Notations from CMI001v4 as REGEXes
 * SP = [\u0020]
 * TAB = [\u0009]
 * ALPHA = [a-zA-Z]
 * DIGIT = [0-9]
 * EXTENDED = [\u00A0-\u00FF]
 * INI_SAFE = [\"|\\|\/|\?|\,|\.|\<|\>|\:|\;|\{|\}|\+|\~|\'|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\-|\|]
 * INI_UNSAFE = [\[\]\=]
 * CSV_SAFE = [\\|\/|\?|\.|\<|\>|\:|\;|\{|\}|\+|\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\-|\||\[|\]|\=]

 * LWS = SP|TAB
 * SPECIAL = INI_SAFE|INI_UNSAFE

 * CSV_OK = ALPHA | DIGIT | EXTENDED | LWS | CSV_SAFE
 * VIEWABLE = ALPHA|DIGIT|EXTENDED|SPECIAL
 */

/**
 * Check value is a valid CMIString255INI
 * BNF: ( *1( VIEWABLE ) *( * LWS *1( VIEWABLE | LWS ) ) ) | ""
 *
 * @param {string} val
 * @return {boolean}
 */
const IsCmiString255INI = (val) => {
  // Remove Leading/Trailing Whitespace
  const str = val ? val.trim() : '';
  const pattern =
    /^(?:[a-zA-Z]|[0-9]|[\u00A0-\u00FF]|[\[\]\=]|[\"|\\|\/|\?|\,|\.|\<|\>|\:|\;|\{|\}|\+|\~|\'|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\-||]|[\u0020]){0,255}$/;
  return str === '' || !!str.match(pattern);
};

/**
 * Check value is a valid CMIString4096INI
 * BNF: ( *1( VIEWABLE ) *( * LWS *1( VIEWABLE | LWS ) ) ) | ""
 *
 * @param {string} val
 * @return {boolean}
 */
const IsCmiString4096INI = (val) => {
  // Remove Leading/Trailing Whitespace
  const str = val ? val.trim() : '';
  const pattern =
    /^(?:[a-zA-Z]|[0-9]|[\u00A0-\u00FF]|[\[\]\=]|[\"|\\|\/|\?|\,|\.|\<|\>|\:|\;|\{|\}|\+|\~|\'|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\-||]|[\u0020]){0,4096}$/;
  return str === '' || !!str.match(pattern);
};

/**
 * Check value is a valid CMIIdentifierINI
 * BNF: *255( DIGIT | ALPHA | EXTENDED | CSV_SAFE )
 *
 * @param {string} val
 * @return {boolean}
 */
const IsCmiIdentifierINI = (val) => {
  const str = val ? val.trim() : '';
  const pattern =
    /^(?:[a-zA-Z]|[0-9]|[\u00A0-\u00FF]|[\\|\/|\?|\.|\<|\>|\:|\;|\{|\}|\+|\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\-|\||\[|\]|\=]){1,255}$/;
  return !!str.match(pattern);
};

/**
 * Check value is a valid CMIVocabulary:Credit
 * BNF: "credit" : "no-credit"
 *
 * @param {string} val
 * @return {boolean}
 */
const IsCmiVocabularyCredit = (val) => {
  // credit or no-credit Case sensitive. All characters must be present
  const str = val ? val.trim() : '';
  return str === 'credit' || str === 'no-credit';
};

/**
 * Check value is a valid CMIVocabularyINI:Status
 * BNF: ("P" | "p" | "N" | "n" | "F" | "f" | "C" | "c" | "I" | "i" | "B" | "b" ) *12(INI_OK)
 *
 * @param {string} val
 * @return {boolean}
 */
const IsCmiVocabularyINIStatus = (val) => {
  // One of the following vocabulary values: passed , failed, complete,
  // incomplete, not attempted, or browsed. All values are case
  // insensitive. Only the first character is significant.
  const str = val ? val.trim() : '';
  const pattern = /^[PpNnFfCcIiBb]/;
  return !!str.match(pattern);
};

/**
 * Check value is a valid CMIVocabularyINI:Mode
 * BNF: ("n" | "r" | "b" | "N" | "R" | "B") *7(INI_OK)
 *
 * @param {string} val
 * @return {boolean}
 */
const IsCmiVocabularyINIMode = (val) => {
  // One of the following values: browse , normal, review. All values are
  // case insensitive. Only the first character is significant.
  const str = val ? val.trim() : '';
  const pattern = /^[nrbNRB]/;
  return !!str.match(pattern);
};

/**
 * Check value is a valid CMIVocabularyINI:Entry
 * BNF: ("A" | "a" | "R" | "r") *9(INI_OK)
 *
 * @param {string} val
 * @return {boolean}
 */
const IsCmiVocabularyEntry = (val) => {
  // This element is appended to the keyword/value pair of Lesson_Status
  // with , (comma) preceding it. There may be spaces trailing and leading
  // this comma. The element value is case-insensitive with only the first
  // character being significant. This element is not present if the value is
  // empty string.
  // Possible values:
  //    ab-initio
  //    resume
  //    empty string
  const str = val ? val.trim() : '';
  const pattern = /^[AaRr]|^$/;
  return !!str.match(pattern);
};

/**
 * Check value is a valid CMIVocabularyINI:Exit
 * BNF: ("T" | "t" | "L" | "l" | "S" | "s") *8(INI_OK)
 *
 * @param {string} val
 * @return {boolean}
 */
const IsCmiVocabularyExit = (val) => {
  // This element is appended to the keyword/value pair of Lesson_Status
  // with , (comma) preceding it. There may be spaces trailing and leading
  // this comma. The element value is case-insensitive with only the first
  // character being significant. If the element is not present, a normal exit
  // Possible values:
  //    time-out
  //    suspend
  //    logout
  //    empty string
  const str = val ? val.trim() : '';
  const pattern = /^[TtLlSs]|^$/;
  return !!str.match(pattern);
};

/**
 * Check value is a valid CMITimespan
 * BNF: 2*4(DIGIT) ":" 2(DIGIT) ":"" 2(DIGIT) ["." 1*2(DIGIT) ]
 *
 * @param {string} val
 * @return {boolean}
 */
const IsCmiTimespan = (val) => {
  // HHHH:MM:SS.SS
  // Hour: 2-4 digits. The decimal part of seconds is optional (0-2 digits).
  const str = val ? val.trim() : '';
  const pattern = /^[0-9]{2,4}:([0-5]?[0-9]):([0-5]?[0-9])(\.[0-9]{1,2})?$/;
  return !!str.match(pattern);
};

/**
 * Check value is a valid CMITime
 * BNF: 2(DIGIT) ":" 2(DIGIT) ":"" 2(DIGIT) ["." 1*2(DIGIT) ]
 *
 * @param {string} val
 * @return {boolean}
 */
const IsCmiTime = (val) => {
  // HH:MM:SS.SS
  // Hour: 24 hour clock. The decimal part of seconds is optional (0-2 digits).
  const str = val ? val.trim() : '';
  const pattern = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])(\.[0-9]{1,2})?$/;
  return !!str.match(pattern);
};

/**
 * Check value is a valid CMIDecimal
 * BNF: ["-"] *DIGIT [ "." *(DIGIT) ]
 *
 * @param {number|string} val We coerce numbers to string so we can regex test it
 * @return {boolean}
 */
const IsCmiDecimal = (val) => {
  const str = val ? val.toString().trim() : '';
  const pattern = /^[+-]?((\d+(\.\d*)?)|(\.\d+))$/;
  return !!str.match(pattern);
};

/**
 * Check value is a valid CMIScore
 * BNF: (CMIDecimal *2( *LWS "," *LWS CMIDecimal ) ) | ""
 *
 * @param {string} val
 * @return {boolean}
 */
const IsCmiScore = (val) => {
  const str = val ? val.toString().trim() : '';
  const pattern =
    /^([\u0020\u0009]*[+-]?((\d+(\.\d*)?)|(\.\d+))[\u0020\u0009]*){1}((,[\u0020\u0009]*)([\u0020\u0009]*[+-]?((\d+(\.\d*)?)|(\.\d+))[\u0020\u0009]*){1}){0,2}$/;
  return str === '' || !!str.match(pattern);
};

const IsCmiDecimal0To100OrBlank = (val) => {
  if (typeof val === 'undefined' || val === null) return true;
  const check = String(val);
  if (check === '') return true;
  if (!IsCmiDecimal(check)) return false;
  const num = parseFloat(check);
  return num >= 0 && num <= 100;
};

module.exports = {
  IsCmiString255INI,
  IsCmiString4096INI,
  IsCmiIdentifierINI,
  IsCmiVocabularyCredit,
  IsCmiVocabularyINIStatus,
  IsCmiVocabularyINIMode,
  IsCmiVocabularyEntry,
  IsCmiVocabularyExit,
  IsCmiTimespan,
  IsCmiTime,
  IsCmiDecimal,
  IsCmiScore,
  IsCmiDecimal0To100OrBlank,
};
