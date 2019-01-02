const utils = require('../../src/utils');

describe('Utils', () => {
  describe('.toSnakeCase', () => {
    describe('when there are no upper case characters', () => {
      let word = 'secrettest';

      it('should return the word back unchanged', () => {
        let result = utils.toSnakeCase(word);
        return expect(result).to.equal(word);
      });
    });

    describe('when the first character is upper case', () => {
      let word = 'Secrettest';

      it('should lowercase the first character', () => {
        let result = utils.toSnakeCase(word);
        return expect(result).to.equal('secrettest');
      });
    });

    describe('when the word is in camelcase', () => {
      let word = 'SecretTest';

      it('should return the word in snake case', () => {
        let result = utils.toSnakeCase(word);
        return expect(result).to.equal('secret_test');
      });
    });

    describe('when there are multiples of the same uppercase characters', () => {
      let word = 'SecretSuperStash';

      it('should return the word in snake case', () => {
        let result = utils.toSnakeCase(word);
        return expect(result).to.equal('secret_super_stash');
      });
    });
  });

  describe('.toCamelCase', () => {
    describe('when there are no underscores or spaces', () => {
      const str = 'camels';

      it('should return the string back unchanged', () => {
        return expect(utils.toCamelCase(str)).to.equal(str);
      });
    });

    describe('when there is a single underscore', () => {
      const str = 'snake_case';
      const expected = 'snakeCase';

      it('should convert the string to the expected camelcase', () => {
        return expect(utils.toCamelCase(str)).to.equal(expected);
      });
    });

    describe('when there are multiple underscores', () => {
      const str = 'long_case_a_free';
      const expected = 'longCaseAFree';

      it('should convert the string to the expected camelcase', () => {
        return expect(utils.toCamelCase(str)).to.equal(expected);
      });
    });

    describe('when there is a single space', () => {
      const str = 'space case';
      const expected = 'spaceCase';

      it('should convert the string to the expected camelcase', () => {
        return expect(utils.toCamelCase(str)).to.equal(expected);
      });
    });

    describe('when there are multiple spaces', () => {
      const str = 'space case a free time';
      const expected = 'spaceCaseAFreeTime';

      it('should convert the string to the expected camelcase', () => {
        return expect(utils.toCamelCase(str)).to.equal(expected);
      });
    });
  });

  describe('.isDate', () => {
    describe('when argument is not a string', () => {
      let val = 123;

      it('should return false', () => {
        let result = utils.isDate(val);
        return expect(result).to.equal(false);
      });
    });

    describe('whrn argument is a non-date string', () => {
      let val = 'testString';

      it('should return false', () => {
        let result = utils.isDate(val);
        return expect(result).to.equal(false);
      });
    });

    describe('when argument is a date string', () => {
      let val = '2018-01-02';

      it('should return true', () => {
        let result = utils.isDate(val);
        return expect(result).to.equal(true);
      });
    });
  });
});