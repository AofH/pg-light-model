let database = require('../../src/database.singleton');

let Table = require('../../src/table');

const databaseOptions = {
  host: 'localhost',
  port: '5432',
  database: 'stag',
  user: 'testuser',
  password: 'testingThings',
};

const modelDefinition = {
  id: 'bigint',
  active: 'boolean',
  created_on: {type: 'date', allowNull: true},
  cost: 'double precision',
  amount: 'integer',
  summary: 'character(10)',
  description: 'character varying (500)',
};


let activeDatabase;

describe('Database Integration', () => {
  before(() => {
    //connect to the database
    return database.connect(databaseOptions).then((result) => {
      if (!result) throw new Error('Database did not connect successfully');
      activeDatabase = result;
      return result;
    }).catch((err) => {
      console.log(err);
      throw err;
    });
  });

  after(() => {
    //kill the database connection
    // DO I Have this ability? is it needed?
  });

  describe('when creating models', () => {
    describe('when creating a model for the first time when the database is connected', () => {
      let table;

      before(() => table = database.createModel('stag.all_fields', modelDefinition));
      after(() => delete database._models['stag.all_fields']);

      it('should have created a table object', () => {
        return expect(table).to.be.instanceOf(Table);
      });

      it('should not have a test property', () => {
        return expect(table.test).to.not.exist;
      });
    });


    describe('when creating a model that shares the same name as one already created', () => {
      let table;

      before(() => table = database.createModel('stag.all_fields', modelDefinition))
      after(() => delete database._models['stag.all_fields']);

      it('should throw an error', () => {
        const func = () => database.createModel('stag.all_fields', modelDefinition);
        return expect(func).to.be.throw(Error);
      });
    });
  });

  describe('when querying', () => {
    let table;
    const sampleRow = {
      id: '1',
      active: true,
      created_on: new Date(),
      cost: 14.3434,
      amount: 4,
      summary: 't',
      description: 'The test test record',
    };

    before(() => table = database.createModel('stag.all_fields', modelDefinition));
    after(() => delete database._models['stag.all_fields']);

    describe('by inserting data into the database', () => {
      let result;

      before(() => table.insert(sampleRow).then((res) => result = res));
      after(() => activeDatabase.query('DELETE FROM stag.all_fields'));

      it('should have returned the number of rows created inside the result', () => {
        return expect(result.rowCount).to.equal(1);
      });

      it('should have saved the record in the database', () => {
        return activeDatabase.query('SELECT * FROM stag.all_fields WHERE id = $1', [sampleRow.id]).then((record) => {
          return expect(record.rows[0].id).to.equal(sampleRow.id);
        });
      });
    });

    describe('by deleting dataa from the database', () => {
      let result;

      before(() => {
        return table.insert(sampleRow)
        .then(() => table.query('DELETE FROM stag.all_fields WHERE id = $1', [sampleRow.id]))
        .then((res) => result = res);
      });

      after(() => activeDatabase.query('DELETE FROM stag.all_fields'));

      it('should have returned the number of rows deleted', () => {
        return expect(result.rowCount).to.equal(1);
      });

      it('should have removed the record from the database', () => {
        return activeDatabase.query('SELECT * FROM stag.all_fields WHERE id = $1', [sampleRow.id]).then((record) => {
          return expect(record.rowCount).to.equal(0);
        });
      });
    });

    describe('by querying for a single record', () => {
      let result;

      before(() => {
        return table.insert(sampleRow)
        .then(() => table.queryForOne('SELECT * FROM stag.all_fields WHERE id = $1', [sampleRow.id]))
        .then((res) => result = res);
      });

      after(() => activeDatabase.query('DELETE FROM stag.all_fields'));

      it('should have returned the expected record', () => {
        return expect(result.id).to.equal(sampleRow.id);
      });
    });

    describe('by querying for many records', () => {
      let result;
      let otherSample = {
        id: '2',
        active: true,
        created_on: new Date(),
        cost: 700,
        amount: 100,
        summary: 'p',
        description: 'The other test record',
      };

      before(() => {
        return table.insert([sampleRow, otherSample])
        .then(() => table.queryForMany('SELECT * FROM stag.all_fields'))
        .then((res) => result = res);
      });

      after(() => activeDatabase.query('DELETE FROM stag.all_fields'));

      it('should return the expected amount of records back', () => {
        return expect(result).to.have.lengthOf(2);
      });
    });
  });

  describe('when performing a transaction', () => {
    describe('when all actions are valid', () => {
      let result;
      let actions = [
        {sql: 'INSERT INTO stag.all_fields (id, active, created_on, cost, amount, summary, description) VALUES ($1, $2, $3, $4, $5, $6, $7)', params: ['1', false, new Date(), 400, 100, 'a', 'Recrod One']},
        {sql: 'INSERT INTO stag.all_fields (id, active, created_on, cost, amount, summary, description) VALUES ($1, $2, $3, $4, $5, $6, $7)', params: ['2', false, new Date(), 400, 100, 'b', 'Recrod two']},
      ];

      before(() => activeDatabase.performTransaction(actions).then((res) => result = res));
      after(() => activeDatabase.query('DELETE FROM stag.all_fields'));

      it('should have returned a commit result', () => {
        return expect(result.command).to.equal('COMMIT');
      });

      it('should have modified the database as expected', () => {
        return activeDatabase.query('SELECT id FROM stag.all_fields').then((records) => {
          return expect(records.rows).to.deep.equal([{id: '1'}, {id: '2'}]);
        });
      });
    });

    describe('when an action is invalid', () => {
      let result;
      let actions = [
        {sql: 'INSERT INTO stag.all_fields (id, active, created_on, cost, amount, summary, description) VALUES ($1, $2, $3, $4, $5, $6, $7)', params: ['1', false, new Date(), 400, 100, 'a', 'Recrod One']},
        {sql: 'INSERT INTO stag.all_fields (id, active, created_on, cost, amount, summary, description) VALUES ($1, $2, $3, $4, $5, $6, $7)', params: ['1', false, new Date(), 400, 100, 'b', 'Recrod two']},
      ];

      before(() => activeDatabase.performTransaction(actions).then((res) => result = res));
      after(() => activeDatabase.query('DELETE FROM stag.all_fields'));

      it('should have returned false', () => {
        return expect(result).to.equal(false);
      });

      it('should not have modified the database as expected', () => {
        return activeDatabase.query('SELECT id FROM stag.all_fields').then((records) => {
          return expect(records.rows).to.have.lengthOf(0);
        });
      });
    });
  });
});