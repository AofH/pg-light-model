const Table = require('../../src/table');

const utils = require('../../src/utils');


describe('Table', () => {
  describe('new ()', () => {
    let name = 'testTable'

    describe('when definition is a string', () => {
      it('should throw an error when creating a new object', () => {
        const func = () => new Table(name, 'stringDef');
        return expect(func).to.throw(Error, 'Definition must be an object when creating a table');
      });
    });

    describe('when definition is an array', () => {
      it('should throw an error when creating a new object', () => {
        const func = () => new Table(name, ['array', 'def']);
        return expect(func).to.throw(Error, 'Definition must be an object when creating a table');
      });
    });

    describe('when defintion is a string and has brackets containing the size', () => {
      let definition = {title: 'character (45)'};
      let testTable;

      before(() => testTable = new Table(name, definition));

      it('should created an instance of Table', () => {
        return expect(testTable).to.be.instanceOf(Table);
      });

      it('should have created the expected columns', () => {
        let expectedColumns = [
          {name: 'title', type: 'character', allowNull: false, json: 'title', validator: utils.typeValidators['character'], size: 45},
        ]

        return expect(testTable.columns).to.deep.equal(expectedColumns);
      });
    });


    describe('when definition is an object', () => {
      describe('where a definition property is a number', () => {
        let definition = {title: 'character varying', id: 14};

        it('should thrown an error when creating a new object', () => {
          const func = () => new Table(name, definition);
          return expect(func).to.throw(Error, 'A column must be defined with a string or with an object');
        });
      });

      describe('where the definition properties are all strings', () => {
        let definition = {title: 'character varying', id: 'bigint'};
        let testTable;

        before(() => testTable = new Table(name, definition));

        it('should have created an instance of Table', () => {
          return expect(testTable).to.be.instanceOf(Table);
        });

        it('should have saved the name of the table', () => {
          return expect(testTable.name).to.equal(name);
        });

        it('should have created the expected columns', () => {
          let expectedColumns = [
            {name: 'title', type: 'character varying', allowNull: false, json: 'title', validator: utils.typeValidators['character varying']},
            {name: 'id', type: 'bigint', allowNull: false, json: 'id', validator: utils.typeValidators['bigint']},
          ];

          return expect(testTable.columns).to.deep.equal(expectedColumns);
        });

      });

      describe('where a definition property is an object and is missing a type property', () => {
        let definition = {title: 'character varying', id: {column: 'homeId'}};

        it('should throw an error', () => {
          const func = () => new Table(name, definition);
          return expect(func).to.throw(Error, 'A type property is required when using an object to define a database column');
        });
      });

      describe('where a definition property is only objects', () => {
        let definition = {title: {type: 'character varying', column:'test_title'}, homeId: {type: 'bigint', allowNull: true}};
        let testTable;

        before(() => testTable = new Table(name, definition));

        it('should have created an instance of Table', () => {
          return expect(testTable).to.be.instanceOf(Table);
        });

        it('should have saved the name of the table', () => {
          return expect(testTable.name).to.equal(name);
        });

        it('should have created the expected columns', () => {
          let expectedColumns = [
            {name: 'test_title', json: 'title', allowNull: false, type: 'character varying', validator: utils.typeValidators['character varying']},
            {name: 'home_id', json: 'homeId', allowNull: true, type: 'bigint', validator: utils.typeValidators['bigint']},
          ];

          return expect(testTable.columns).to.deep.equal(expectedColumns);
        });
      });
    });

    describe('when the type is not a recognized postgres type', () => {
      let definition = {title: 'random Type'};

      it('should throw an error', () => {
        let func = () => new Table(name, definition);
        return expect(func).to.throw(Error, 'random Type is not a valid column type');
      });
    });
  });

  describe('.setDatabase', () => {
    let database = {query: sinon.stub().resolves(true)};
    let name = 'TestTable';
    let definition = {title: 'character varying'};
    let testTable;

    before(() => testTable = new Table(name, definition));

    it('should set the ._db of table to expected object', () => {
      testTable.setDatabase(database);

      return expect(testTable._db).to.deep.equal(database);
    });
  });

  describe('.validate', () => {
    let name = 'validTest';
    let definition = {title: 'character varying', id: 'bigint'};
    let testTable;

    before(() => testTable = new Table(name, definition));

    describe('when the row is valid', () => {
      let row = {title: 'Test Title', id: 1};

      it('should return true;', () => {
        let result = testTable.validate(row);
        return expect(result).to.equal(true);
      });
    });

    describe('when the row contains an invalid property', () => {
      let row = {title: 'Test Title', id: 'balah'};

      it('should return false', () => {
        let result = testTable.validate(row);
        return expect(result).to.equal(false);
      });
    });

    describe('when row has a null value in property that does not allow nulls', () => {
      let row = {title: 'Test Title', id: null};

      it('should return false', () => {
        let result = testTable.validate(row);
        return expect(result).to.equal(false);
      });
    });
  });

  describe('.insert', () => {
    let name = 'validTest';
    let definition = {title: 'character varying', id: 'bigint'};
    let testTable;

    before(() => testTable = new Table(name, definition));

    describe('when records is a row object', () => {
      let records = {title: 'test title', id: 2};
      let db = {query: sinon.stub().resolves(true)};
      let result;

      before(() => {
        testTable.setDatabase(db)
        return testTable.insert(records).then((res) => result = res);
      });

      it('should have returned true', () => {
        return expect(result).to.equal(true);
      });

      it('should have called db.query with expected args', () => {
        let sql = 'INSERT INTO validTest (title, id) VALUES ($1, $2)';
        let values = ['test title', 2];

        return expect(db.query).to.be.calledWith(sql, values);
      });
    });

    describe('when records are an array of rows', () => {
      let records = [
        {title: 'test title', id: 2},
        {title: 'second title', id: 3}
      ];
      let db = {query: sinon.stub().resolves(true)};
      let result;

      before(() => {
        testTable.setDatabase(db);
        return testTable.insert(records).then((res) => result = res);
      });

      it('should have returned true', () => {
        return expect(result).to.equal(true);
      });

      it('should have called db.query with expected args', () => {
        let sql = 'INSERT INTO validTest (title, id) VALUES ($1, $2), ($3, $4)';
        let values = ['test title', 2, 'second title', 3];

        return expect(db.query).to.be.calledWith(sql, values);
      });
    });
  });

  describe('.transform', () => {
    let name = 'validTest';
    let definition = {title: 'character varying', homeId: 'bigint'};
    let testTable;

    before(() => testTable = new Table(name, definition));

    describe('when records is a row object', () => {
      let row = {title: 'Test Title', home_id: 2};

      it('should return a transformed object into JSON style', () => {
        return testTable.transform(row).then((result) => {
          return expect(result).to.deep.equal({title: 'Test Title', homeId: 2});
        });
      });
    });

    describe('when records is an array of rows', () => {
      let rows = [
        {title: 'Test Title', home_id: 2},
        {title: 'second Title', home_id: 4}
      ];

      let expected = [
        {title: 'Test Title', homeId: 2},
        {title: 'second Title', homeId: 4}
      ];

      it('should return the transformed objects in an array', () => {
        return testTable.transform(rows).then((result) => {
          return expect(result).to.deep.equal(expected);
        });
      });
    });
  });

  describe('.query', () => {
    // simple mapping over db.query so tests probably aren't helpful here
  });

  describe('.queryForOne', () => {
    let name = 'validTest';
    let definition = {title: 'character varying', homeId: 'bigint'};
    let testTable;

    before(() => testTable = new Table(name, definition));

    describe('when results.rowCount does not exist', () => {
      let db = {query: sinon.stub().resolves({rows:[]})};

      before(() => testTable.setDatabase(db));

      it('should return null', () => {
        return testTable.queryForOne('SELECT * from ltc.tests', []).then((result) => {
          return expect(result).to.equal(null);
        });
      });
    });

    describe('when results.rowCount is 0', () => {
      let db = {query: sinon.stub().resolves({rowCount: 0, rows:[]})};

      before(() => testTable.setDatabase(db));

      it('should return null', () => {
        return testTable.queryForOne('SELECT * from ltc.tests', []).then((result) => {
          return expect(result).to.equal(null);
        });
      });
    });

    describe('when results.rowCount is greater than 0', () => {
      const rows = [{title: 'First', home_id: 1}, {title: 'second', home_id: 2}];
      const expected = {title: 'First', homeId: 1};
      let db = {query: sinon.stub().resolves({rowCount: 2, rows})};

      before(() => testTable.setDatabase(db));

      it('should return a single object back', () => {
        return testTable.queryForOne('SELECT * from ltc.tests', []).then((result) => {
          return expect(result).to.deep.equal(expected);
        });
      });
    });
  });

  describe('.queryForMany', () => {
    let name = 'validTest';
    let definition = {title: 'character varying', homeId: 'bigint'};
    let testTable;

    before(() => testTable = new Table(name, definition));

    describe('when results.rowCount does not exist', () => {
      let db = {query: sinon.stub().resolves({rows:[]})};

      before(() => testTable.setDatabase(db));

      it('should return null', () => {
        return testTable.queryForMany('SELECT * from ltc.tests', []).then((result) => {
          return expect(result).to.equal(null);
        });
      });
    });

    describe('when results.rowCount is 0', () => {
      let db = {query: sinon.stub().resolves({rowCount: 0, rows:[]})};

      before(() => testTable.setDatabase(db));

      it('should return null', () => {
        return testTable.queryForMany('SELECT * from ltc.tests', []).then((result) => {
          return expect(result).to.equal(null);
        });
      });
    });

    describe('when results.rowCount is greater than 0', () => {
      const rows = [{title: 'First', home_id: 1}, {title: 'second', home_id: 2}];
      const expected = [{title: 'First', homeId: 1}, {title: 'second', homeId: 2}];
      const db = {query: sinon.stub().resolves({rowCount: 2, rows})};

      before(() => testTable.setDatabase(db));

      it('should return all rows found back', () => {
        return testTable.queryForMany('SELECT * from ltc.tests', []).then((result) => {
          return expect(result).to.deep.equal(expected);
        });
      });
    });
  });
});