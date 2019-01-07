const database = require('../../src/database');

const Table = require('../../src/table');
const TestFixture = require('../../src/test.fixtures');
const databaseServer = require('../../src/postgres.db');

describe('Database', () => {
  describe('.query', () => {
    describe('when database has not connected', () => {
      let prevDb;
      let errorMsg = 'Database needs to be connected before running a query';

      before(() => {
        prevDb = database._db;
        database._db = null;
      });

      after(() => database._db = prevDb);

      it('should reject with a error', () => {
        let func = () => database.query('SELECT * FROM test.table LIMIT 1', []);
        return expect(func()).to.be.rejectedWith(Error, errorMsg);
      });
    });

    describe('when database has connected', () => {
      let result;
      let prevDb;
      let sql = 'SELECT * FROM test.table LIMIT 1';
      let queryStub = sinon.stub().resolves(true);

      before(() => {
        prevDb = database._db;
        database._db = {query: queryStub};
        return database.query(sql, []).then((res) => result = res);
      });

      after(() => database._db = prevDb);

      it('should have returned true', () => {
        return expect(result).to.equal(true);
      });

      it('should have called the .query with expected args', () => {
        return expect(queryStub).to.be.calledWith(sql, []);
      });
    });
  });

  describe('.performTransaction', () => {
    describe('when database has not connected', () => {
      let prevDb;
      let errorMsg = 'Database needs to be connected before running a transaction';

      before(() => {
        prevDb = database._db;
        database._db = null;
      });

      after(() => database._db = prevDb);

      it('should reject with a error', () => {
        let func = () => database.performTransaction('SELECT * FROM test.table LIMIT 1', []);
        return expect(func()).to.be.rejectedWith(Error, errorMsg);
      });
    });

    describe('when database has connected', () => {
      let result;
      let prevDb;
      let actions = [{sql: 'SELECT * FROM test.table LIMIT 1', params: []}];
      let actionStub = sinon.stub().resolves(true);

      before(() => {
        prevDb = database._db;
        database._db = {performTransaction: actionStub};
        return database.performTransaction(actions).then((res) => result = res);
      });

      after(() => database._db = prevDb);

      it('should have returned true', () => {
        return expect(result).to.equal(true);
      });

      it('should have called the .query with expected args', () => {
        return expect(actionStub).to.be.calledWith(actions);
      });
    });
  });

  describe('.createModel', () => {
    describe('when creating a model for the first time', () => {
      let name = 'testTable';
      let definition = {name: 'character varying', id: 'integer'};
      let result;

      before(() => result = database.createModel(name, definition));
      after(() => delete database._models[name]);

      it('should have returned a tables object', () => {
        return expect(result).to.be.instanceOf(Table);
      });

      it('should have stored the table object in ._models object', () => {
        return expect(database._models[name]).to.deep.equal(result);
      });
    });

    describe('when creating a model with the same name as one already created', () => {
      let name = 'testTable';
      let definition = {name: 'character varying', id: 'integer'};

      before(() => database.createModel(name, definition));
      after(() => delete database._models[name]);

      it('should throw an error', () => {
        let func = () => database.createModel(name, definition);
        return expect(func).to.throw(Error, `Model ${name} has already been defined`);
      });
    });
  });

  describe('.connect', () => {
    let name = 'testTable';
    let definition = {name: 'character varying', id: 'integer'};

    describe('when .connect throws an error', () => {
      before(() => sinon.stub(databaseServer, 'connect').rejects(new Error('Test Error')));
      after(() => databaseServer.connect.restore());

      it('should return false', () => {
        let options = {host: 'adfkaldfja'}
        return database.connect(options).then((result) => {
          return expect(result).to.equal(false);
        });
      });
    });

    describe('when .connect is successful', () => {
      let result;
      let connectStub;
      let mockDb = {query: sinon.stub().resolves(true)};
      let options = {host: 'adfkaldfja'}

      before(() => {
        database.createModel(name, definition);
        connectStub = sinon.stub(databaseServer, 'connect').resolves(mockDb)
        return database.connect(options).then((res) => result = res);
      });
      
      after(() => {
        databaseServer.connect.restore();
        delete database._models[name];
      });

      it('should return true', () => {
        return expect(result).to.equal(true);
      });

      it('should have called .connect with the expected args', () => {
        let args = {host: options.host, useFixtures: false};
        return expect(connectStub).to.be.calledWith(args);
      });

      it('should have stored the created database in the ._db variable', () => {
        return expect(database._db).to.deep.equal(mockDb);
      });

      it('should have loaded the database into the models', () => {
        let testTable = database._models[name];
        return expect(testTable._db).to.deep.equal(mockDb);
      });

      it('should not have loaded testFixutures into the table objects', () => {
        let testTable = database._models[name];
        return expect(testTable.test).to.not.exist;
      });
    });

    describe('when .connect is successful and useFixtures is true', () => {
      let result;
      let connectStub;
      let mockDb = {query: sinon.stub().resolves(true)};
      let options = {host: 'adfkaldfja', useFixtures: true};

      before(() => {
        database.createModel(name, definition);
        connectStub = sinon.stub(databaseServer, 'connect').resolves(mockDb);
        return database.connect(options).then((res) => result = res);
      });

      after(() => {
        databaseServer.connect.restore();
        delete database._models[name];
      });

      it('should return true', () => {
        return expect(result).to.equal(true);
      });

      it('should have called .connect with the expected args', () => {
        let args = {host: options.host, useFixtures: true};
        return expect(connectStub).to.be.calledWith(args);
      });

      it('should have stored the created database in the ._db variable', () => {
        return expect(database._db).to.deep.equal(mockDb);
      });

      it('should have loaded the database into the models', () => {
        let testTable = database._models[name];
        return expect(testTable._db).to.deep.equal(mockDb);
      });

      it('should have loaded testFixutures into the table objects', () => {
        let testTable = database._models[name];
        return expect(testTable.test).to.be.instanceOf(TestFixture);
      });
    });
  });
});
