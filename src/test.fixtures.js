const utils = require('./utils');
const randomizer = require('./test.randomizer');

module.exports = TestFixture;

function TestFixture(table) {
  this.model = table;
};

TestFixture.prototype._createRow = function() {
  return this.model.columns.reduce((row, column) => {
    let snakeCasedType = utils.toCamelCase(column.type);
    row[column.json] = randomizer[snakeCasedType]();
    return row;
  }, {});
};

TestFixture.prototype.generateOne = function(override = {}) {
  let row = this._createRow();
  return Promise.resolve({...row, ...override});
};

TestFixture.prototype.generateMany = function(amount, override = {}) {
  let rows = [];

  for(var i = 0; i < amount; i++) {
    let row = this._createRow();
    rows.push({...row, ...override});
  }

  return Promise.resolve(rows);
};

TestFixture.prototype.generateAndSaveOne = function(override) {
  return this.generateOne(override).then((row) => {
    return this.model.insert(row).then(() => row);
  });
};

TestFixture.prototype.generateAndSaveMany = function(amount, override) {
  return this.generateMany(amount, override).then((rows) => {
    return this.model.insert(rows).then(() => rows);
  });
};

TestFixture.prototype.removeOne = function(column, value) {
  let sql = `DELETE FROM ${this.model.name} WHERE ${column} = $1`;
  return this.model.query(sql, [value]);
};

TestFixture.prototype.removeMany = function(column, values) {
  let placeholders = values.map((v, i) => `$${i+1}`).join(', ');
  let sql = `DELETE FROM ${this.model.name} WHERE ${column} in (${placeholders})`;
  return this.model.query(sql, values);
};

TestFixture.prototype.removeAll = function() {
  let sql = `DELETE FROM ${this.model.name}`;
  return this.model.query(sql, []);
};
