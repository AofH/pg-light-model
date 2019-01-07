let Table = require('./table');
let TestFixture = require('./test.fixtures');
let databaseServer = require('./postgres.db');

let models = {};

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

module.exports.connect = (options) => {
  options = {...defaultOptions, ...options};

  return databaseServer.connect(options).then((db) => {
    Object.keys(models).forEach((modelKey) => {
      models[modelKey].setDatabase(db);

      if (options.useFixtures) {
        models[modelKey].test = new TestFixture(models[modelKey]);
      }
    });
    this._db = db;
    return true;
  }).catch((err) => {
    console.error('Could not connect to database: ' + err.message);
    return false;
  });
};

module.exports.createModel = (name, definition) => {
  if (models[name]) { 
    throw new Error(`Model ${name} has already been defined`);
  }

  let table = new Table(name, definition);
  models[name] = table;
  return models[name];
};

module.exports._models = models;