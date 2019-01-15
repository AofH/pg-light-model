# Postgres Light Model

** Under Development **

This is a package that allows for lightly modeling tables that are found within postgres. It offers the ability to validate data according to the table type. It also exposes some nicer functions for inserting data and performing transactions. It also has the ability to generate random rows for tables that defined within.

## How to Use


## TODO:

#### Features
* Create a table if not exists
* Ability to create clients as needed.

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
