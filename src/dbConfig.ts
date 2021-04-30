import * as oracledb from 'oracledb';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: 'localhost:1521/BdProject',
  privilege: oracledb.SYSDBA,
};
