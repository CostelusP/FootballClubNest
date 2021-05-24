import * as oracledb from 'oracledb';
import { checkConnection } from 'src/utils/connections';
import { v4 as uuidv4 } from 'uuid';
import { PlayerEntity } from './playerEntity';
import { findClubByUserId } from '../clubs/clubOrm';

export async function findOne(id: string): Promise<any> {
  const connection = await checkConnection();
  const getPlayer = await connection.execute(
    'SELECT * FROM player WHERE id= :id',
    { id },
  );
  if (!getPlayer) return { message: 'Player not found' };
  const returnedPlayer = [{}];
  if (getPlayer && getPlayer?.rows) {
    for (let i = 0; i < getPlayer.metaData.length; i++) {
      returnedPlayer[getPlayer.metaData[i].name.toLowerCase()] =
        getPlayer.rows[0][i];
    }
  }
  return returnedPlayer;
}

export async function find(
  offset: number,
  limit: number,
  search: string,
  id,
  isFrom,
  role,
  userId,
): Promise<any> {
  const connection = await checkConnection();
  let getPlayers;

  const newSearch = `%${search}%`;
  if (id && isFrom && isFrom === 'Club') {
    if (search !== 'default') {
      getPlayers = await connection.execute(
        'SELECT * FROM player WHERE full_name LIKE :newSearch AND CLUB_ID= :id',
        { newSearch, id },
      );
    } else {
      getPlayers = await connection.execute(
        'SELECT * FROM player WHERE club_id= :id',
        { id },
      );
    }
  } else {
    if (role === 'Coach') {
      const getClub = await findClubByUserId(userId);
      const idClub = getClub.id;
      if (search !== 'default') {
        getPlayers = await connection.execute(
          'SELECT * FROM player WHERE full_name LIKE :newSearch AND club_id= :idClub',
          { newSearch, idClub },
        );
      } else {
        getPlayers = await connection.execute(
          'SELECT * FROM player WHERE club_id= :idClub',
          { idClub },
        );
      }
    } else {
      if (search !== 'default') {
        getPlayers = await connection.execute(
          'SELECT * FROM player WHERE full_name LIKE :newSearch',
          { newSearch },
        );
      } else {
        getPlayers = await connection.execute('SELECT * FROM player');
      }
    }
  }
  if (!getPlayers) return { message: 'Players not found' };
  const returnedPlayers = [];
  for (let i = 0; i < getPlayers.rows.length; i++) {
    const player = {};
    for (let j = 0; j < getPlayers.metaData.length; j++) {
      player[getPlayers.metaData[j].name.toLowerCase()] = getPlayers.rows[i][j];
    }
    returnedPlayers.push(player);
  }
  returnedPlayers.sort((a, b) => {
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
  const page_number = Math.ceil(returnedPlayers.length / 12);
  const players = returnedPlayers.slice(offset, offset + limit);
  return { players, page_number };
}

export async function create(player: PlayerEntity): Promise<any> {
  const {
    full_name,
    rating,
    salary,
    position,
    date_of_birth,
    weight,
    height,
    age,
    club_id,
  } = player;
  const sql = `Insert INTO PLAYER(id, full_name, rating, salary, position, date_of_birth, weight, height, age,club_id) 
  VALUES( :id, :full_name, :rating, :salary, :position, TO_DATE( :date_of_birth,'YYYY-MM-DD'), :weight, :height, :age, :club_id)`;
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
    club_id,
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

export async function update(player: PlayerEntity, id: string): Promise<any> {
  const {
    full_name,
    rating,
    salary,
    position,
    date_of_birth,
    weight,
    height,
    age,
    club_id,
  } = player;

  const sql = `UPDATE PLAYER SET full_name= :full_name, rating= :rating, salary= :salary, position= :position,
   date_of_birth= TO_DATE( :date_of_birth,'YYYY-MM-DD'), weight= :weight, height= :height, age= :age, club_id= :club_id WHERE id= :id`;

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
    club_id,
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
  const sql = 'Delete FROM PLAYER WHERE id= :id';
  const options = {
    autoCommit: true,
    bindDefs: {
      id: { type: oracledb.STRING, maxSize: 60 },
    },
  };
  return await connection.execute(sql, { id }, options);
}

export async function getByClubId(clubId: string): Promise<any> {
  const connection = await checkConnection();
  console.log(clubId);
  const getPlayers = await connection.execute(
    'SELECT * FROM PLAYER WHERE club_id= :clubId',
    { clubId },
  );

  if (!getPlayers) return { message: 'Players not found' };
  const returnedPlayers = [];
  for (let i = 0; i < getPlayers.rows.length; i++) {
    const player = {};
    for (let j = 0; j < getPlayers.metaData.length; j++) {
      player[getPlayers.metaData[j].name.toLowerCase()] = getPlayers.rows[i][j];
    }
    returnedPlayers.push(player);
  }
  returnedPlayers.sort((a, b) => {
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

  return returnedPlayers;
}
