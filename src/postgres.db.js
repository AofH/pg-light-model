const {Pool} = require('pg');

let database = null;
let defaultOptions = {};

module.exports.connect = (options) => {
  if (this.database) {
    return this.database;
  }

  options = {...defaultOptions, ...options};
  const pool = new Pool(options);

  return pool.connect().then((client) => {
    client.release(); 
    database = new PostgresDatabase(pool);
    return database;
  });
};

function PostgresDatabase(pool) {
  this.db = pool;
};

PostgresDatabase.prototype.query = function(sql, params) {
  return this.db.query(sql, params);
};

PostgresDatabase.prototype._performActions = function(actions, client) {
  return client.query('BEGIN').then(() => {
    return actions.reduce((p, action) => {
      return p.then(() => client.query(action.sql, action.params));
    }, Promise.resolve());
  }).then(() => client.query('COMMIT'));
};

PostgresDatabase.prototype.performTransaction = function(actions) {
  let invalidActions = actions.filter((action) => !action.sql || !action.params);
  if (invalidActions.length !== 0) {
    return Promise.reject(new Error('Transaction actions require a sql and an action property'));
  }

  return this.db.connect().then((client) => {
    return this._performActions(actions, client).then((results) => {
      return client.release().then(() => results);
    }).catch((err) => {
      console.error(`Error performing a  transaction: ${err.message}`);
      return client.query('Rollback').then(() => client.release()).then(() => false);
    });
  });
};
