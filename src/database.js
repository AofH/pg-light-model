let Table = require('./table');
let databaseServer = require('./postgres.db');

let models = {};

module.exports._db = null;
module.exports.query = function (sql, params) {
  return this._db.query(sql, params);
};

module.exports.connect = (options) => {
  return databaseServer.connect(options).then((db) => {
    Object.keys(models).forEach((modelKey) => {
      models[modelKey].loadDatabase(db);
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
    throw new Error(`Model ${model} has already been defined`);
  }

  let table = new Table(name, definition);
  models[name] = table;
  return models[name];
};

module.exports._models = models;