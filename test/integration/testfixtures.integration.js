let database = require('../../src/database.singleton');

let Table = require('../../src/table');

const databaseOptions = {
  host: 'localhost',
  port: '5432',
  database: 'stag',
  user: 'testuser',
  password: 'testingThings',
  useFixtures: true,
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
let fullTable;

describe('Test Fixtures Integration', () => {
  before(() => {
    return database.connect(databaseOptions)
    .then((result) => activeDatabase = result)
    .then(() => fullTable = database.createModel('stag.all_fields', modelDefinition));
  });

  after(() => activeDatabase.end());

  describe('when creating a single row without any overrides that is not saved to the database', () => {
    let row;

    before(() => fullTable.test.generateOne().then((r) => row = r));
    after(() => fullTable.query('DELETE FROM stag.all_fields'));

    it('should have returned a generated record', () => {
      const missingFields = Object.keys(row).filter((k) => !modelDefinition[k]);
      return expect(missingFields).to.have.lengthOf(0);
    });

    it('should not have saved the record to the database', () => {
      return fullTable.queryForOne('SELECT * FROM stag.all_fields WHERE id = $1', [row.id]).then((result) => {
        return expect(result).to.be.null;
      });
    });
  });

  describe('when creating a single row with overrides that is not saved to the database', () => {
    let row;
    let override = {id: '14'};

    before(() => fullTable.test.generateOne(override).then((r) => row = r));
    after(() => fullTable.query('DELETE FROM stag.all_fields'));

    it('should have returned a generated report', () => {
      const missingFields = Object.keys(row).filter((k) => !modelDefinition[k]);
      return expect(missingFields).to.have.lengthOf(0);
    });

    it('should have used the id value from the override object', () => {
      return expect(row.id).to.equal(override.id);
    });

    it('should not have saved the record to the database', () => {
      return fullTable.queryForOne('SELECT * FROM stag.all_fields WHERE id = $1', [row.id]).then((result) => {
        return expect(result).to.be.null;
      });
    });
  });

  describe('when creating a single row witout any overrids that is saved to the database', () => {
    let row;

    before(() => fullTable.test.generateAndSaveOne().then((r) => row = r));
    after(() => fullTable.query('DELETE FROM stag.all_fields'));

    it('should have returned a generated report', () => {
      const missingFields = Object.keys(row).filter((k) => !modelDefinition[k]);
      return expect(missingFields).to.have.lengthOf(0);
    });

    it('should have saved the record to the database', () => {
      return fullTable.queryForOne('SELECT * FROM stag.all_fields WHERE id = $1', [row.id]).then((result) => {
        return expect(result).to.deep.equal(row);
      });
    });

  });

  describe('when creating a single row with overrides that is saved to the database', () => {
    let row;
    let override = {id: '14'};

    before(() => fullTable.test.generateAndSaveOne(override).then((r) => row = r));
    after(() => fullTable.query('DELETE FROM stag.all_fields'));

    it('should have returned a generated report', () => {
      const missingFields = Object.keys(row).filter((k) => !modelDefinition[k]);
      return expect(missingFields).to.have.lengthOf(0);
    });

    it('should have used the id value from the override object', () => {
      return expect(row.id).to.equal(override.id);
    });

    it('should have saved the record to the database', () => {
      return fullTable.queryForOne('SELECT * FROM stag.all_fields WHERE id = $1', [row.id]).then((result) => {
        return expect(result).to.deep.equal(row);
      });
    });
  });


  describe('when generating many rows without any overrides which are not saved to the database', () => {
    let rows;

    before(() => fullTable.test.generateMany(3).then((r) => rows = r));
    after(() => fullTable.query('DELETE FROM stag.all_fields'));

    it('should have returned an array with the expected length ', () => {
      return expect(rows).to.have.lengthOf(3);
    });

    it('should not have saved the records to the database', () => {
      let ids = rows.map((r) => r.id);
      return fullTable.queryForMany('SELECT * FROM stag.all_fields WHERE id IN ($1, $2, $3)', ids).then((result) => {
        return expect(result).to.equal(null);
      });
    });
  });

  describe('when generating many rows with overrides which are not saved to the database', () => {
    let rows;
    let override = {summary: 'test'};

    before(() => fullTable.test.generateMany(3, override).then((r) => rows = r));
    after(() => fullTable.query('DELETE FROM stag.all_fields'));

    it('should have returned an array with the expected length ', () => {
      return expect(rows).to.have.lengthOf(3);
    });

    it('should have set the summary propety for each row to the override value', () => {
      const invalidValues = rows.filter((r) => r.summary !== override.summary);
      return expect(invalidValues).to.have.lengthOf(0);
    });

    it('should not have saved the records to the database', () => {
      let ids = rows.map((r) => r.id);
      return fullTable.queryForMany('SELECT * FROM stag.all_fields WHERE id IN ($1, $2, $3)', ids).then((result) => {
        return expect(result).to.equal(null);
      });
    });
  });

  describe('when generating many rows without any overrides which are saved to the database', () => {
    let rows;

    before(() => fullTable.test.generateAndSaveMany(3).then((r) => rows = r));
    after(() => fullTable.query('DELETE FROM stag.all_fields'));

    it('should have returned an array with the expected length ', () => {
      return expect(rows).to.have.lengthOf(3);
    });

    it('should have saved the records to the database', () => {
      let ids = rows.map((r) => r.id);
      return fullTable.queryForMany('SELECT * FROM stag.all_fields WHERE id IN ($1, $2, $3)', ids).then((result) => {
        return expect(result).to.deep.equal(rows);
      });
    });
  });

  describe('when generating many rows with a override which are saved to the database', () => {
    let rows;
    let override = {description: 'test'};

    before(() => fullTable.test.generateAndSaveMany(3, override).then((r) => rows = r));
    after(() => fullTable.query('DELETE FROM stag.all_fields'));

    it('should have returned an array with the expected length ', () => {
      return expect(rows).to.have.lengthOf(3);
    });

    it('should have set the description propety for each row to the override value', () => {
      const invalidValues = rows.filter((r) => r.description !== override.description);
      return expect(invalidValues).to.have.lengthOf(0);
    });

    it('should have saved the records to the database', () => {
      let ids = rows.map((r) => r.id);
      return fullTable.queryForMany('SELECT * FROM stag.all_fields WHERE id IN ($1, $2, $3)', ids).then((result) => {
        return expect(result).to.deep.equal(rows);
      });
    });
  });

  describe('when removing a single row', () => {
    let rowId;
    let delResponse;

    before(() => {
      return fullTable.test.generateAndSaveMany(10)
      .then((rows) => {
        rowId = rows[0].id;
        return fullTable.test.removeOne('id', rowId);
      }).then((r) => delResponse = r);
    });

    after(() => fullTable.query('DELETE FROM stag.all_fields'));

    it('should have returned the amount of rows deleted', () => {
      return expect(delResponse.rowCount).to.equal(1);
    });

    it('should have removed the specific record', () => {
      return fullTable.queryForOne('SELECT * FROM stag.all_fields WHERE id = $1', [rowId]).then((result) => {
        return expect(result).to.be.null;
      });
    });
  });

  describe('when removing multiple rows', () => {
    let rowIds;
    let delResponse;

    before(() => {
      return fullTable.test.generateAndSaveMany(10)
      .then((rows) => {
        rowIds = [rows[0].id, rows[2].id, rows[4].id];
        return fullTable.test.removeMany('id', rowIds);
      }).then((r) => delResponse = r);
    });

    after(() => fullTable.query('DELETE FROM stag.all_fields'));

    it('should have returned the amount of rows deleted', () => {
      return expect(delResponse.rowCount).to.equal(3);
    });

    it('should have removed the specific record', () => {
      return fullTable.queryForOne('SELECT * FROM stag.all_fields WHERE id IN ($1, $2, $3)', [rowIds]).then((result) => {
        return expect(result).to.be.null;
      });
    });
  });

  describe('when removing all rows', () => {
    let delResponse;

    before(() => {
      return fullTable.test.generateAndSaveMany(10)
      .then(() => fullTable.test.removeAll())
      .then((r) => delResponse = r);
    });

    after(() => fullTable.query('DELETE FROM stag.all_fields'));

    it('should have returned the expected amount of rows deleted', () => {
      return expect(delResponse.rowCount).to.equal(10);
    });

    it('should remove all records from the database', () => {
      return fullTable.query('SELECT * FROM stag.all_fields').then((response) => {
        return expect(response.rowCount).to.equal(0);
      });
    });
  });
});
