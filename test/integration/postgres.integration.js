let database = require('../../src/database.singleton');

let Table = require('../../src/table');

let databaseOptions = {
  host: 'localhost',
  port: '5432',
  database: 'stag',
  user: 'testuser',
  password: 'testingThings',
}

describe('Database Integration', () => {
  before(() => {
    //connect to the database
    return database.connect(databaseOptions).then((result) => {
      if (!result) throw new Error('Database did not connect successfully');
      return result;
    })
  })

  describe('when creating models', () => {
    let modelDefinition = {
      id: 'bigint',
      active: 'boolean',
      created_on: {type: 'date', allowNull: true},
      cost: 'double precision',
      amount: 'integer',
      summary: 'character',
      description: 'character varying',
    };

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

      it('should be able to insert correctly', () => {
        let data = {
          id: 1,
          active: true,
          created_on: new Date(),
          cost: 14.3434,
          amount: 4,
          summary: 't',
          description: 'The test test record'
        };

        return table.insert(data).then((result) => {
          return expect(result.rowCount).to.equal(1);
        });
      });

      it('should be able to query correctly', () => {
      });

      it('should be able to queryOne correctly', () => {
      });

      it('should be able to queryForMany correctly', () => {
      });

    });


    describe('when creating a model that shares the same name as one already created', () => {
    });
  });

  describe('when querying a table', () => {
  });

  describe('when performing a transaction', () => {
  });

  after(() => {
    //kill the database connection
    // DO I Have this ability? is it needed?
  });

  it('should succeed', () => {
    return expect(true).to.equal(true);
  });
});