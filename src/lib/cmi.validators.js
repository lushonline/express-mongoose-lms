/* eslint-disable no-useless-escape */

const IsCmiString255 = (val) => {
  // Remove Leading/Trailing Whitespace
  const str = val ? val.trim() : '';
  const pattern =
    /^(?:[a-zA-Z]|[0-9]|[\u00A0-\u00FF]|[\[\]\=]|[\"|\\|\/|\?|\,|\.|\<|\>|\:|\;|\{|\}|\+|\~|\'|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\-||]|[\u0020]){0,255}$/;
  return !!str.match(pattern);
};

const IsCmiString4096 = (val) => {
  // Remove Leading/Trailing Whitespace
  const str = val ? val.trim() : '';
  const pattern =
    /^(?:[a-zA-Z]|[0-9]|[\u00A0-\u00FF]|[\[\]\=]|[\"|\\|\/|\?|\,|\.|\<|\>|\:|\;|\{|\}|\+|\~|\'|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\-||]|[\u0020]){0,4096}$/;
  return !!str.match(pattern);
};

const IsCmiIdentifier = (str) => {
  if (str.length > 255) return false;
  return str.search(/^[A-Za-z0-9\-_:]+$/) !== -1;
};

const IsCmiCredit = (val) => {
  const str = val.toLowerCase();
  return str === 'credit' || str === 'no-credit';
};

const IsCmiStatus = (val) => {
  const str = val.toLowerCase();
  return str.search(/^(passed|completed|failed|incomplete|browsed|not attempted)$/) !== -1;
};

const IsCmiLessonMode = (val) => {
  const str = val.toLowerCase();
  return str.search(/^(browse|normal|review)$/) !== -1;
};

const IsCmiEntry = (val) => {
  const str = val.toLowerCase();
  return str === 'ab-initio' || str === 'resume' || str === '';
};

const IsCmiExit = (val) => {
  const str = val.toLowerCase();
  return str === 'time-out' || str === 'suspend' || str === 'logout' || str === '';
};

const IsCmiTimespan = (str) => {
  // HHHH:MM:SS.SS
  // Hour: 2-4 digits. The decimal part of seconds is optional (0-2 digits).
  return str.search(/^\d{2,4}:\d\d:\d\d(\.\d{1,2})?$/) !== -1;
};

const IsCmiDecimal = (str) => {
  return str.search(/\d+/) !== -1 && str.search(/^[-+]?((0*)|([1-9]\d*))(\.\d+)?$/) !== -1;
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
  IsCmiString255,
  IsCmiString4096,
  IsCmiIdentifier,
  IsCmiCredit,
  IsCmiStatus,
  IsCmiLessonMode,
  IsCmiEntry,
  IsCmiExit,
  IsCmiTimespan,
  IsCmiDecimal,
  IsCmiDecimal0To100OrBlank,
};
