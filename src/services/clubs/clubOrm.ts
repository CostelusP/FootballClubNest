import * as oracledb from 'oracledb';
import { checkConnection } from 'src/utils/connections';
import { v4 as uuidv4 } from 'uuid';
import { ClubEntity } from './clubEntity';

export async function find(search: string): Promise<any> {
  const connection = await checkConnection();
  let getClubs;

  const newSearch = `%${search}%`;
  if (search !== 'default') {
    getClubs = await connection.execute(
      'SELECT * FROM player WHERE full_name LIKE :newSearch',
      { newSearch },
    );
  } else {
    getClubs = await connection.execute('SELECT * FROM player');
  }
  if (!getClubs) return { message: 'Players not found' };
  const returnedClubs = [];
  for (let i = 0; i < getClubs.rows.length; i++) {
    const club = {};
    for (let j = 0; j < getClubs.metaData.length; j++) {
      club[getClubs.metaData[j].name.toLowerCase()] = getClubs.rows[i][j];
    }
    returnedClubs.push(club);
  }
  returnedClubs.sort((a, b) => {
    const fa = a.full_name.toLowerCase(),
      fb = b.full_name.toLowerCase();

    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
    return 0;
  });

  return returnedClubs;
}

export async function create(player: ClubEntity): Promise<any> {
  const {
    full_name,
    rating,
    salary,
    position,
    date_of_birth,
    weight,
    height,
    age,
  } = player;
  const sql = `Insert INTO CLUB (id, full_name, rating, salary, position, date_of_birth, weight, height, age) VALUES( :id, :full_name, :rating, :salary, :position, TO_DATE( :date_of_birth,'YYYY-MM-DD'), :weight, :height, :age)`;
  const id = uuidv4();

  const data = {
    id,
    full_name,
    rating,
    salary,
    position,
    date_of_birth,
    weight,
    height,
    age,
  };

  const options = {
    autoCommit: true,
    bindDefs: {
      id: { type: oracledb.STRING, maxSize: 60 },
      full_name: { type: oracledb.STRING, maxSize: 60 },
      age: { type: oracledb.NUMBER, maxSize: 40 },
      date_of_birth: { type: oracledb.DATE },
      height: { type: oracledb.NUMBER },
      weight: { type: oracledb.NUMBER },
      rating: { type: oracledb.NUMBER },
      salary: { type: oracledb.NUMBER },
      position: { type: oracledb.STRING, maxSize: 10 },
    },
  };
  const connection = await checkConnection();
  return await connection.execute(sql, data, options);
}

export async function update(player: ClubEntity, id: string): Promise<any> {
  const {
    full_name,
    rating,
    salary,
    position,
    date_of_birth,
    weight,
    height,
    age,
  } = player;

  const sql = `UPDATE CLUB SET full_name= :full_name, rating= :rating, salary= :salary, position= :position,
     date_of_birth= TO_DATE( :date_of_birth,'YYYY-MM-DD'), weight= :weight, height= :height, age= :age WHERE id= :id`;

  const data = {
    full_name,
    rating,
    salary,
    position,
    date_of_birth,
    weight,
    height,
    age,
    id,
  };

  const options = {
    autoCommit: true,
    bindDefs: {
      full_name: { type: oracledb.STRING, maxSize: 60 },
      age: { type: oracledb.NUMBER, maxSize: 40 },
      date_of_birth: { type: oracledb.DATE },
      height: { type: oracledb.NUMBER },
      weight: { type: oracledb.NUMBER },
      rating: { type: oracledb.NUMBER },
      salary: { type: oracledb.NUMBER },
      position: { type: oracledb.STRING, maxSize: 10 },
    },
  };
  const connection = await checkConnection();
  return await connection.execute(sql, data, options);
}

export async function remove(id: string): Promise<string> {
  const connection = await checkConnection();
  const sql = 'Delete FROM CLUB WHERE id= :id';
  const options = {
    autoCommit: true,
    bindDefs: {
      id: { type: oracledb.STRING, maxSize: 60 },
    },
  };
  return await connection.execute(sql, { id }, options);
}
