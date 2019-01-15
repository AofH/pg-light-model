

-- Setup database config values
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET client_min_messages = warning;

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';

SET search_path = public, pg_catalog;
SET default_tablespace = '';
SET default_with_oids = false;

CREATE SCHEMA IF NOT EXISTS stag;

CREATE TABLE IF NOT EXISTS stag.all_fields(
  id BIGINT PRIMARY KEY,
  active BOOLEAN NOT NULL,
  created_on DATE,
  cost DOUBLE PRECISION NOT NULL,
  amount INTEGER NOT NULL,
  summary CHARACTER NOT NULL,
  description CHARACTER VARYING NOT NULL
);

