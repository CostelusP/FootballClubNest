import { validateEmail } from '../../utils/utils';
import * as oracledb from 'oracledb';
import { checkConnection } from 'src/utils/connections';
import { v4 as uuidv4 } from 'uuid';

export async function findByEmail(email: string): Promise<any> {
  if (!validateEmail(email)) return { message: 'Invalid email' };

  const connection = await checkConnection();
  const existUser = await connection.execute(
    'SELECT * FROM userclub WHERE email_address= :email',
    { email },
  );
  return existUser;
}

export async function findOne(id: string): Promise<any> {
  if (!id) return { message: 'Invalid id' };

  const connection = await checkConnection();
  const existUser = await connection.execute(
    'SELECT * FROM userclub WHERE id= :id',
    { id },
  );
  return existUser;
}

export async function create(user: any): Promise<any> {
  const { user_name, hashPassword, email_address } = user;
  const sql = `Insert INTO USERCLUB(id, user_name, email_address, password)  VALUES( :id, :user_name, :email_address, :password)`;
  const id = uuidv4();

  const data = {
    id,
    user_name,
    password: hashPassword,
    email_address,
  };

  const options = {
    autoCommit: true,
    bindDefs: {
      id: { type: oracledb.STRING, maxSize: 40 },
      user_name: { type: oracledb.STRING, maxSize: 100 },
      email_address: { type: oracledb.STRING, maxSize: 40 },
      password: { type: oracledb.STRING, maxSize: 100 },
    },
  };
  const connection = await checkConnection();
  return await connection.execute(sql, data, options);
}
