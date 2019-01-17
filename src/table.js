const utils = require('./utils');
const _ = require('lodash');


const checkForSize = (options) => {
  let sizeRegex = /\(\d*\)/;
  if (sizeRegex.test(options.type)) {
    const sizeSection = sizeRegex.exec(options.type)[0];
    options.size = Number.parseInt(sizeSection.slice(1, sizeSection.length - 1), 10);
    options.type = options.type.split(sizeRegex)[0].trim();
  }

  return options;
};

const createColumnFromString = (name, type) => {
  let options = {
    name: utils.toSnakeCase(name),
    type,
  };

  options = checkForSize(options);
  return options;
}

const createColumnFromObject = (name, columnDef) => {
  if (!columnDef.type) {
    throw new Error('A type property is required when using an object to define a database column');
  }

  let options = {
    type: columnDef.type,
    name: columnDef.column ? columnDef.column : utils.toSnakeCase(name),
    allowNull: columnDef.allowNull ? true : false,
  };

  options = checkForSize(options);
  return options;
}

const createColumns = (definitions) => {
  const jsonKeys = Object.keys(definitions);

  let columns = jsonKeys.map((key) => {
    let type = typeof definitions[key];
    if (type !== 'string' && type !== 'object') {
      throw new Error('A column must be defined with a string or with an object');
    }

    let columnOptions = {json: key, allowNull: false};

    if (type === 'string') {
      columnOptions = {...columnOptions, ...createColumnFromString(key, definitions[key])};
    }

    if (type === 'object') {
      columnOptions = {...columnOptions, ...createColumnFromObject(key, definitions[key])};
    }

    if (!utils.typeValidators[columnOptions.type]) {
      throw new Error(`${columnOptions.type} is not a valid column type`);
    }
    columnOptions.validator = utils.typeValidators[columnOptions.type];

    return columnOptions;
  });

  return columns;
}

const createIncrementedPlaceHolders = (offset=0, mapSize) => {
  offset = (offset * mapSize) + 1;
  return [...Array(mapSize)].map((e, index) => `$${offset + index}`).join(', ');
};


function Table (name, definition) {
  if (_.isString(definition) || _.isArray(definition)) {
    throw new Error('Definition must be an object when creating a table');
  }

  this.columns = createColumns(definition)
  this.name = name
  this._db = null
};

Table.prototype.setDatabase = function(db) {
  this._db = db;
}

Table.prototype.validate = function(row) {
  return this.columns.reduce((valid, column) => {
    if (!valid) return false;

    if (!row.hasOwnProperty(column.json)) {
      return column.allowNull;
    }

    return column.validator(row[column.json]);
  }, true);
}

Table.prototype.insert = function(records) {
  if (!Array.isArray(records)) {
    records = [records];
  }

  const fields = this.columns.map((column) => column.name).join(', ');

  let placeholders = ``;
  const flatRecords = records.map((record, offset) => {
    const incrementedPlaceHolders = createIncrementedPlaceHolders(offset, this.columns.length);
    placeholders = (offset === 0) ? `(${incrementedPlaceHolders})` : `${placeholders}, (${incrementedPlaceHolders})`;

    return this.columns.map((column) => {
      const val = record[column.json];
      if (column.type === 'date' && val) return new Date(val);
      return typeof val !== 'undefined' ? val : null;
    });
  }).reduce((flat, params) => flat.concat(params), [])

  const sql = `INSERT INTO ${this.name} (${fields}) VALUES ${placeholders}`;
  return this.query(sql, flatRecords);
}

Table.prototype.transform = function(records) {
  const transformRecord = (record) => {
    return Object.keys(record).reduce((transformed, key) => {
      let columnDef = this.columns.filter((cd) => key === cd.name)[0];
      (columnDef) ? transformed[columnDef.json] = record[key] : transformed[key] = record[key];
      return transformed;
    }, {});
  };

  if (!Array.isArray(records)) {
    return Promise.resolve(transformRecord(records));
  }

  return Promise.resolve(records.map((r) => transformRecord(r)));
}

Table.prototype.query = function(sql, args) {
  return this._db.query(sql, args);
}

// TODO: remove the transform because for it won't work for multi table queries
// Potentially run a snake_case to camelCase instead
Table.prototype.queryForOne = function(sql, args) {
  return this.query(sql, args).then((results) => {
    if (!results.rowCount || results.rowCount <= 0) {
      return null;
    }

    return this.transform(results.rows[0]);
  }).catch((err) => {
    console.error(err.message);
    return null;
  });
}

// TODO: remove the transform because for it won't work for multi table queries
Table.prototype.queryForMany = function(sql, args) {
  return this.query(sql, args).then((results) => {
    if (!results.rowCount || results.rowCount <= 0) {
      return null;
    }

    return this.transform(results.rows);
  }).catch((err) => {
    console.error(err.message);
    return null;
  });
}

module.exports = Table;