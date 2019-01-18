const TestFixture = require('../../src/test.fixtures');

describe('Test Fixture', () => {
  describe('constructor', () => {
    let fixture;

    before(() => fixture = new TestFixture({}));

    it('should create a TestFixture object', () => {
      return expect(fixture).to.be.instanceOf(TestFixture);
    });
  });


  describe('.generateOne', () => {
    describe('when the column definition contains all types', () => {
      let fixture;
      let model = {columns: [
        {json: 'id', allowNull: false, name: 'id', type: 'bigint'},
        {json: 'isActive', allowNull: false, name: 'is_active', type: 'boolean'},
        {json: 'createdOn', allowNull: false, name: 'created_on', type: 'date'},
        {json: 'cost', allowNull: false, name: 'cost', type: 'double precision'},
        {json: 'timesUsed', allowNull: false, name: 'times_used', type: 'integer'},
        {json: 'summary', allowNull: false, name: 'summary', type: 'character'},
        {json: 'description', allowNull: false, name: 'description', type: 'character varying'},
      ]};

      before(() => fixture = new TestFixture(model));

      describe('when there are no overrides', () => {
        let result;

        before(() => fixture.generateOne().then((res) => result = res));

        it('should return an object', () => {
          return expect(result).to.be.instanceOf(Object);
        });

        it('should have a .id property that is a bigint', () => {
          return expect(Number.isInteger(Number.parseInt(result.id, 10))).to.be.true;
        });

        it('should have a .isActive property which is a boolean', () => {
          return expect(result.isActive).to.be.a('boolean');
        });

        it('should have a .createdOn property which is a date', () => {
          // TODO: right code for date stuff
        });

        it('should have a .cost property which is a double precision', () => {
          return expect(result.cost).to.be.finite;
        });

        it('should a .timesUsed property which is an integer', () => {
          return expect(Number.isInteger(result.timesUsed)).to.be.true;
        });

        it('should have a .summary property which is a character', () => {
          return expect(result.summary).to.have.lengthOf(1);
        });

        it('should have a .description property which is a string', () => {
          return expect(result.description).to.be.a('string');
        });
      });

      describe('when there is an override passed', () => {
        let result;
        let override = {
          cost: 70,
          activity: true
        };

        before(() => fixture.generateOne(override).then((res) => result = res));

        it('should return an object', () => {
          return expect(result).to.be.instanceOf(Object);
        });

        it('should have a .id property that is a bigint', () => {
          return expect(Number.isInteger(Number.parseInt(result.id, 10))).to.be.true;
        });

        it('should have a .isActive property which is a boolean', () => {
          return expect(result.isActive).to.be.a('boolean');
        });

        it('should have a .createdOn property which is a date', () => {
          // TODO: right code for date stuff
        });

        it('should a .timesUsed property which is an integer', () => {
          return expect(Number.isInteger(result.timesUsed)).to.be.true;
        });

        it('should have a .summary property which is a character', () => {
          return expect(result.summary).to.have.lengthOf(1);
        });

        it('should have a .description property which is a string', () => {
          return expect(result.description).to.be.a('string');
        });

        it('should have a .cost property which is set by the override', () => {
          return expect(result.cost).to.equal(70);
        });

        it('should have added a .activity property from the override', () => {
          return expect(result.activity).to.equal(true);
        });
      });
    });
  });

  describe('.generateMany', () => {
    let fixture;
    let model = {columns: [
      {json: 'id', allowNull: false, name: 'id', type: 'bigint'},
      {json: 'isActive', allowNull: false, name: 'is_active', type: 'boolean'},
      {json: 'createdOn', allowNull: false, name: 'created_on', type: 'date'},
      {json: 'cost', allowNull: false, name: 'cost', type: 'double precision'},
      {json: 'timesUsed', allowNull: false, name: 'times_used', type: 'integer'},
      {json: 'summary', allowNull: false, name: 'summary', type: 'character'},
      {json: 'description', allowNull: false, name: 'description', type: 'character varying'},
    ]};

    before(() => fixture = new TestFixture(model));

    describe('when the amount is 0', () => {
      it('should return an empty array', () => {
        return fixture.generateMany(0).then((result) => {
          return expect(result).to.deep.equal([]);
        });
      });
    });

    describe('when there is no override', () => {
      let result;
      let amount = 3;

      before(() => fixture.generateMany(amount).then((res) => result = res));

      it('should return an array', () => {
        return expect(result).to.be.an('array');
      });

      it('should have a length of ' + amount, () => {
        return expect(result).to.have.lengthOf(3);
      });
    });

    describe('when there is an override', () => {
      let result;
      let amount = 3;
      let override = {timesUsed: 17};

      before(() => fixture.generateMany(amount, override).then((res) => result = res));

      it('should return an array', () => {
        return expect(result).to.be.an('array');
      });

      it('should have a length of ' + amount, () => {
        return expect(result).to.have.lengthOf(3);
      });

      it('should have changed the fields in each element to the the override field', () => {
        let allOverriden = result.filter((e) => e.timesUsed === override.timesUsed);
        return expect(allOverriden).to.have.lengthOf(result.length);
      });
    });
  });

  describe('.generateAndSaveOne', () => {
    let fixture;
    let model = {
      name: 'test.table',
      query: sinon.stub().resolves(true),
      insert: sinon.stub().resolves(true),
      columns: [
        {json: 'id', name: 'id', allowNull: false, type: 'integer'},
        {json: 'name', name: 'name', allowNull: false, type: 'character varying'},
      ]
    };

    before(() => fixture = new TestFixture(model));

    describe('when no override is passed', () => {
      let result;

      before(() => fixture.generateAndSaveOne().then((res) => result = res));

      it('should have returned an object', () => {
        return expect(result).to.be.an('object');
      });

      it('should have a .id property that is an integer', () => {
        return expect(Number.isInteger(result.id)).to.equal(true);
      });

      it('should have a .name property which is a string', () => {
        return expect(result.name).to.be.a('string');
      });
    });

    describe('when an override is passed', () => {
      let result;
      let override = {name: 'tester'};

      before(() => fixture.generateAndSaveOne(override).then((res) => result = res));

      it('should have returned an object', () => {
        return expect(result).to.be.an('object');
      });

      it('should have a .id property that is an integer', () => {
        return expect(Number.isInteger(result.id)).to.equal(true);
      });

      it('should have a .name property which set to the override value', () => {
        return expect(result.name).to.equal(override.name);
      });
    });
  });

  describe('.generateAndSaveMany', () => {
    let fixture;
    let model = {
      name: 'test.table',
      query: sinon.stub().resolves(true),
      insert: sinon.stub().resolves(true),
      columns: [
        {json: 'id', name: 'id', allowNull: false, type: 'integer'},
        {json: 'name', name: 'name', allowNull: false, type: 'character varying'},
      ]
    };

    before(() => fixture = new TestFixture(model));

    describe('when no override is passed', () => {
      let result;
      let amount = 4;

      before(() => fixture.generateAndSaveMany(amount).then((res) => result = res));

      it('should have returned an array', () => {
        return expect(result).to.be.an('array');
      });

      it('should have a length of ' + amount, () => {
        return expect(result).to.have.lengthOf(amount);
      });
    });

    describe('when an override is passed', () => {
      let result;
      let amount = 4;
      let override = {name: 'tester'};

      before(() => fixture.generateAndSaveMany(amount, override).then((res) => result = res));

      it('should have returned an array', () => {
        return expect(result).to.be.an('array');
      });

      it('should have a length of ' + amount, () => {
        return expect(result).to.have.lengthOf(amount);
      });

      it('should have set all the elements .name property to the override value', () => {
        let setElements = result.filter((e) => e.name === override.name);
        return expect(setElements.length).to.equal(result.length);
      });
    });
  });

  describe('.removeOne', () => {
    let result;
    let fixture;
    let model = {
      name: 'test.table',
      query: sinon.stub().resolves(true),
      insert: sinon.stub().resolves(true),
      columns: [
        {json: 'id', name: 'id', allowNull: false, type: 'integer'},
        {json: 'name', name: 'name', allowNull: false, type: 'character varying'},
      ]
    };

    before(() => {
      fixture = new TestFixture(model);
      return fixture.removeOne('id', 3).then((res) => result = res);
    });

    it('should have returned true', () => {
      return expect(result).to.equal(true);
    });

    it('should have called model.query with the expected arguments', () => {
      let sql = `DELETE FROM test.table WHERE id = $1`;
      let params = [3];
      return expect(model.query).to.be.calledWith(sql, params);
    });
  });

  describe('.removeMany', () => {
    let result;
    let fixture;
    let model = {
      name: 'test.table',
      query: sinon.stub().resolves(true),
      insert: sinon.stub().resolves(true),
      columns: [
        {json: 'id', name: 'id', allowNull: false, type: 'integer'},
        {json: 'name', name: 'name', allowNull: false, type: 'character varying'},
      ]
    };

    before(() => {
      fixture = new TestFixture(model);
      return fixture.removeMany('id', [3, 4, 5, 6]).then((res) => result = res);
    });

    it('should have returned true', () => {
      return expect(result).to.equal(true);
    });

    it('should have called model.query with the expected arguments', () => {
      let sql = `DELETE FROM test.table WHERE id in ($1, $2, $3, $4)`;
      let params = [ 3, 4, 5, 6];
      return expect(model.query).to.be.calledWith(sql, params);
    });
  });

  describe('.removeAll', () => {
    let result;
    let fixture;
    let model = {
      name: 'test.table',
      query: sinon.stub().resolves(true),
      insert: sinon.stub().resolves(true),
      columns: [
        {json: 'id', name: 'id', allowNull: false, type: 'integer'},
        {json: 'name', name: 'name', allowNull: false, type: 'character varying'},
      ]
    };

    before(() => {
      fixture = new TestFixture(model);
      return fixture.removeAll().then((res) => result = res);
    });

    it('should have returned true', () => {
      return expect(result).to.equal(true);
    });

    it('should have called model.query with the expected arguments', () => {
      let sql = `DELETE FROM test.table`;
      let params = [];
      return expect(model.query).to.be.calledWith(sql, params);
    });
  });
});
