const parseDate = require('date-fns/parse');
const isValidDate = require('date-fns/is_valid');
const _ = require('lodash');

module.exports.toSnakeCase = (str) => {
  const upperCaseChars = str.match(/([A-Z])/g);
  if (!upperCaseChars) {
    return str;
  }

  let snakeCase = upperCaseChars.reduce((s, char) => s.replace(new RegExp(char), '_' + char.toLowerCase()), str);
  return snakeCase.slice(0, 1) === '_' ? snakeCase.slice(1) : snakeCase;
}

module.exports.isDate = (val) => {
  return (!_.isString(val)) ? false : isValidDate(parseDate(val));
}


// TODO: Handle all postgres types here
module.exports.typeValidators = {
  'bigint': Number.isInteger,
  'boolean': _.isBoolean,
  'date': this.isDate,
  'double precision': Number.isFinite,
  'integer': Number.isInteger,
  'character': _.isString,
  'character varying': _.isString,
};
