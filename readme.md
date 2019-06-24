# Postgres Light Model

** Under Development **

This is a package that allows for lightly modeling tables, which are stored in posgres, with code. This allows for automatic validation of data when performing inserts and updates since a table column types will be known. It also exposes a nicer interface for performing transactions.

## Tests

Through out the tests, they will reference the database which is called `stag`. This name was chosen mostly at random and it helps that it is short.

### Unit Testing
To run unit tests, either of the following commands will run all the tests.

  * `npm test`
  * `npm run test`

If you are looking to run a specific test suite, the tests use `mocha` so if that library is installed globally (`npm install -g mocha`) you can use the `-g` flag to run specific tests. For example
        
    `mocha -g 'Utils .toSnakeCase'`

### Integration Testing

The integration tests rely on having an instance of postgres available. This project includes a docker and docker-compose file to create an available instance for it. To run this instance you can use the following command

* `docker-compose up postgres`

Alternatively, npm script commands can be used to handle the docker aspect

* `npm run database` - Works like the previous docker-compose command.
* `npm run database-detached` - This will run the docker image in a detached state.
* `npm run database-down` - This will shut down the docker image running for the database.
* `npm run database-down-clean` - This will shut down the docker image running and remove all the data that was stored in it.

## TODO:

#### Features
* Create a table if not exists
* Ability to create clients as needed.
* Add missing types.

#### Types

__Supported Types__

* bigint
* boolean
* date
* integer

__Somewhat Supported__

* double precision
* character
* character varying

__Unsupported__

* int8
* bigserial
* serial8
* bit (n)
* bit varying (n)
* varbit (n)
* bool
* box
* bytea
* char (n)
* varchar (n)
* cidr
* circle
* float8
* inet
* int
* int4
* interval (fields) (p)
* json
* jsonb
* line
* lseg
* macaddr
* money
* numeric (p, s)
* decimal (p, s)
* path
* pg_lsn
* point
* polygon
* real
* float4
* smallint
* int2
* smallserial
* serial2
* serial
* serial4
* text
* time (p) (without time zone)
* time (p) with timezone
* timetz
* timestamp (p) without time zone
* timestamp (p) with timezone
* timestamptz
* tsquery
* tsvector
* txid_snapshot
* uuid
* xml
