const randomizer = require('../../src/test.randomizer');

describe('Test Randomizer', () => {
  describe('.bigint', () => {
    let result;

    before(() => result = Number.parseInt(randomizer.bigint(), 10));

    it('should return a result that is greater than or equal to 10 000', () => {
      result = Number.parseInt(result, 10);
      return expect(result).to.be.above(9999);
    });

    it('should return a result that is less than or equal to 1 000 000', () => {
      return expect(result).to.be.below(1000001);
    });
  });

  describe('.boolean', () => {
    it('should return a boolean', () => {
      let result = randomizer.boolean();
      return expect(result).to.be.a('boolean');
    });
  });

  describe('.date', () => {
    //TODO: tests
  });

  describe('.doublePrecision', () => {
    it('should return a double', () => {
      let result = randomizer.doublePrecision();
      return expect(result).to.be.finite;
    });
  });

  describe('.integer', () => {
    let result;

    before(() => result = randomizer.integer());

    it('should return an integer', () => {
      return expect(Number.isInteger(result)).to.be.true;
    });

    it('should return a result that is greater than or equal to 0', () => {
      return expect(result).to.be.above(-1);
    });

    it('should return a result that is less than or equal to 1000', () => {
      return expect(result).to.be.below(1001);
    });
  });

  describe('.character', () => {
    it('should return a single character', () => {
      let result = randomizer.character();
      return expect(result).to.have.lengthOf(1);
    });
  });

  describe('.characterVarying', () => {
    let result;

    before(() => result = randomizer.characterVarying());

    it('should return a string', () => {
      return expect(result).to.be.a('string');
    });

    it('should have a length greater than 4', () => {
      return expect(result.length).to.be.above(4); 
    });

    it('should have a length less than 51', () => {
      return expect(result.length).to.be.below(51);
    });
  });
});