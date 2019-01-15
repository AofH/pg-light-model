let Table = require('./table');
let TestFixture = require('./test.fixtures');
let databaseServer = require('./postgres.db');

let models = {};
let activeOptions = {};

const defaultOptions = {
  useFixtures: false,
};

module.exports._db = null;
module.exports.query = function (sql, params) {
  if (!this._db) {
    return Promise.reject(new Error('Database needs to be connected before running a query'));
  }

  return this._db.query(sql, params);
};

module.exports.performTransaction = (actions) => {
  if (!this._db) {
    return Promise.reject(new Error('Database needs to be connected before running a transaction'));
  }

  return this._db.performTransaction(actions);
};

const loadDatabaseIntoTable = function(table, db, useFixtures) {
  table.setDatabase(db);

  if (useFixtures) {
    table.test = new TestFixture(table);
  }
};

module.exports.connect = (options) => {
  this.activeOptions = {...defaultOptions, ...options};

  return databaseServer.connect(this.activeOptions).then((db) => {
    Object.keys(models).forEach((modelKey) => {
      loadDatabaseIntoTable(models[modelKey], db, this.activeOptions.useFixtures);
    });
    this._db = db;
    return db;
  });
};

module.exports.disconnect = () => {
  return this._db.end();
};

module.exports.createModel = (name, definition) => {
  if (models[name]) { 
    throw new Error(`Model ${name} has already been defined`);
  }

  let table = new Table(name, definition);

  if (this._db) {
    loadDatabaseIntoTable(table, this._db, this.activeOptions.useFixtures);
  }

  models[name] = table;
  return models[name];
};

module.exports._models = models;