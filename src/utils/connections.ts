import * as oracledb from 'oracledb';
import { config } from '../dbConfig';
let connection;

export async function checkConnection() {
  try {
    connection = await oracledb.getConnection(config);
    console.log('connected to database');
  } catch (err) {
    console.error('here', err.message);
  }

  return connection;
}
