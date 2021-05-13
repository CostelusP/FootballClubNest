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
      'SELECT * FROM CLUB WHERE name LIKE :newSearch',
      { newSearch },
    );
  } else {
    getClubs = await connection.execute('SELECT * FROM CLUB');
  }

  if (!getClubs) return { message: 'Club not found' };
  const returnedClubs = [];

  for (let i = 0; i < getClubs.rows.length; i++) {
    const club = {};
    let coach;
    for (let j = 0; j < getClubs.metaData.length; j++) {
      if (getClubs.metaData[j].name == 'USER_ID') {
        const val = getClubs.rows[i][j];
        const getCoach = await connection.execute(
          'SELECT * FROM USERCLUB WHERE ID= :val',
          { val },
          { outFormat: oracledb.OBJECT, autoCommit: true },
        );
        if (getCoach?.rows?.length !== 0) {
          let key;
          const keys = Object.keys(getCoach.rows[0]);
          let n = keys.length;
          coach = {};
          while (n--) {
            key = keys[n];
            coach[key.toLowerCase()] = getCoach.rows[0][key];
          }
        } else {
          coach = {};
        }
      }
      club[getClubs.metaData[j].name.toLowerCase()] = getClubs.rows[i][j];
    }
    returnedClubs.push({ club, coach });
  }
  returnedClubs.sort((a, b) => {
    const fa = a.club.name.toLowerCase(),
      fb = b.club.name.toLowerCase();

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

export async function create(club: ClubEntity): Promise<any> {
  const { name, description } = club;
  const sql = `Insert INTO CLUB (id, name, description) VALUES( :id, :name, :description)`;
  const id = uuidv4();

  const data = {
    id,
    name,
    description,
  };

  const options = {
    autoCommit: true,
    bindDefs: {
      id: { type: oracledb.STRING, maxSize: 50 },
      name: { type: oracledb.STRING, maxSize: 30 },
      description: { type: oracledb.STRING, maxSize: 15 },
    },
  };
  const connection = await checkConnection();
  return await connection.execute(sql, data, options);
}

export async function update(club: ClubEntity, id: string): Promise<any> {
  const { name, description } = club;
  console.log(club);
  const sql = `UPDATE CLUB SET name= :name, description= :description WHERE id= :id`;

  const data = {
    name,
    description,
    id,
  };

  const options = {
    autoCommit: true,
    bindDefs: {
      name: { type: oracledb.STRING, maxSize: 30 },
      description: { type: oracledb.STRING, maxSize: 20 },
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

export async function findOne(id: string): Promise<any> {
  const connection = await checkConnection();
  const getClub = await connection.execute('SELECT * FROM CLUB WHERE id= :id', {
    id,
  });
  console.log(getClub);
  if (!getClub) return { message: 'Club not found' };
  const club = {};
  let coach;
  if (getClub && getClub?.rows) {
    for (let i = 0; i < getClub.metaData.length; i++) {
      if (getClub.metaData[i].name == 'USER_ID') {
        const val = getClub.rows[0][i];
        console.log(val);
        const getCoach = await connection.execute(
          'SELECT * FROM USERCLUB WHERE ID= :val',
          { val },
          { outFormat: oracledb.OBJECT, autoCommit: true },
        );
        if (getCoach?.rows?.length !== 0) {
          let key;
          const keys = Object.keys(getCoach.rows[0]);
          let n = keys.length;
          coach = {};
          while (n--) {
            key = keys[n];
            coach[key.toLowerCase()] = getCoach.rows[0][key];
          }
        } else {
          coach = {};
        }
      }
      club[getClub.metaData[i].name.toLowerCase()] = getClub.rows[0][i];
    }
  }
  return { club, coach };
}
