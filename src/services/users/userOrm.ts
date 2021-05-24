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

export async function find(
  offset: number,
  limit: number,
  search: string,
): Promise<any> {
  const connection = await checkConnection();
  const is_admin = 'F';
  let getUsers;
  const newSearch = `%${search}%`;
  if (search !== '') {
    getUsers = await connection.execute(
      'SELECT user_name, is_admin, id, email_address FROM userclub WHERE user_name LIKE :newSearch AND is_admin= :is_admin',
      { newSearch, is_admin },
    );
  } else {
    getUsers = await connection.execute(
      'SELECT user_name, is_admin,id, email_address FROM userclub WHERE is_admin= :is_admin',
      { is_admin },
    );
  }

  const returnedUsers = [];
  for (let i = 0; i < getUsers.rows.length; i++) {
    const user = {};
    for (let j = 0; j < getUsers.metaData.length; j++) {
      user[getUsers.metaData[j].name.toLowerCase()] = getUsers.rows[i][j];
    }
    const id_user = getUsers.rows[i][2];
    const getClub = await connection.execute(
      'SELECT * FROM CLUB WHERE user_id= :id_user',
      { id_user },
      { outFormat: oracledb.OBJECT, autoCommit: true },
    );
    const club = {};
    if (getClub?.rows?.length !== 0) {
      let key;
      const keys = Object.keys(getClub.rows[0]);
      let n = keys.length;
      while (n--) {
        key = keys[n];
        club[key.toLowerCase()] = getClub.rows[0][key];
      }
    }
    returnedUsers.push({ coach: user, club });
  }

  returnedUsers.sort((a, b) => {
    const fa = a.coach.user_name.toLowerCase(),
      fb = b.coach.user_name.toLowerCase();

    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
    return 0;
  });

  const page_number = Math.ceil(returnedUsers.length / 10);
  const coaches = returnedUsers.slice(offset, offset + limit);
  return { coaches, page_number };
}

export async function remove(id: string): Promise<string | any> {
  const connection = await checkConnection();
  const getClub = await connection.execute(
    'SELECT * FROM CLUB WHERE user_id= :id',
    { id },
    { outFormat: oracledb.OBJECT, autoCommit: true },
  );
  if (getClub?.rows?.length !== 0)
    return { message: 'Should remove the club first' };
  const sql = 'Delete FROM userclub WHERE id= :id';
  const options = {
    autoCommit: true,
    bindDefs: {
      id: { type: oracledb.STRING, maxSize: 60 },
    },
  };
  return await connection.execute(sql, { id }, options);
}

export async function update(user: any, id: string): Promise<string> {
  const { user_name, hashPassword, email_address, password } = user;
  const connection = await checkConnection();
  let updatedUser;
  if (password === 'TestStrong*/&') {
    const options = {
      autoCommit: true,
      bindDefs: {
        user_name: { type: oracledb.STRING, maxSize: 60 },
        email_address: { type: oracledb.STRING, maxSize: 60 },
      },
    };
    const sql =
      'UPDATE userclub SET user_name= :user_name, email_address= :email_address WHERE id= :id';
    updatedUser = await connection.execute(
      sql,
      { user_name, email_address, id },
      options,
    );
  } else {
    const options = {
      autoCommit: true,
      bindDefs: {
        user_name: { type: oracledb.STRING, maxSize: 60 },
        email_address: { type: oracledb.STRING, maxSize: 60 },
        password: { type: oracledb.STRING, maxSize: 100 },
      },
    };
    const sql =
      'UPDATE userclub SET user_name= :user_name, email_address= :email_address, password= :hashPassword WHERE id= :id';
    updatedUser = await connection.execute(
      sql,
      { user_name, email_address, id, hashPassword },
      options,
    );
  }
  connection.close();
  return updatedUser;
}

export async function getAllCoaches() {
  const connection = await checkConnection();
  const is_admin = 'F';
  const getUsers = await connection.execute(
    'SELECT * FROM USERCLUB WHERE is_admin= :is_admin AND ID NOT IN(SELECT user_id from CLUB where user_id IS NOT NULL)',
    { is_admin },
    {
      outFormat: oracledb.OBJECT,
      autoCommit: true,
    },
  );
  if (getUsers?.rows) return getUsers.rows;
  else return { message: 'Error on getting coaches' };
}
