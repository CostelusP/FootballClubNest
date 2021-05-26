import * as oracledb from 'oracledb';
import { checkConnection } from 'src/utils/connections';
import { v4 as uuidv4 } from 'uuid';
import { getByClubId } from '../players/playerOrm';
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
    const club = { id: '', name: '', description: '', user_id: '' };
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
    const players = await getByClubId(club.id);
    returnedClubs.push({ club, coach, players });
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
  const { name, description, user_id } = club;

  const sql = `Insert INTO CLUB (id, name, description,user_id) VALUES( :id, :name, :description, :user_id)`;
  const id = uuidv4();

  const data = {
    id,
    name,
    description,
    user_id,
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
  const { name, description, user_id } = club;
  const sql = `UPDATE CLUB SET name= :name, description= :description, user_id= :user_id WHERE id= :id`;

  const data = {
    name,
    description,
    id,
    user_id,
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
  if (!getClub) return { message: 'Club not found' };
  const club = {};
  let coach;
  if (getClub && getClub?.rows) {
    for (let i = 0; i < getClub.metaData.length; i++) {
      if (getClub.metaData[i].name == 'USER_ID') {
        const val = getClub.rows[0][i];
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

export async function findClubByUserId(id: string): Promise<any> {
  if (!id) return { message: 'Invalid id' };
  const connection = await checkConnection();
  const getClub = await connection.execute(
    'SELECT * FROM club WHERE user_id= :id',
    { id },
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

  return club;
}
