import * as oracledb from 'oracledb';
import { checkConnection } from 'src/utils/connections';
import { v4 as uuidv4 } from 'uuid';
import { EventEntity } from './eventEntity';

export async function find(
  offset: number,
  limit: number,
  search: string,
  time: string,
): Promise<any> {
  let getEvents;
  const connection = await checkConnection();
  const newSearch = `%${search}%`;
  if (time === 'prezent') {
    if (search) {
      getEvents = await connection.execute(
        `SELECT * FROM EVENT WHERE name LIKE :newSearch AND 
        event_date BETWEEN TRUNC(SYSDATE) AND trunc(sysdate) + interval '1' day - interval '1' second`,
        { newSearch },
      );
    } else {
      getEvents = await connection.execute(
        "SELECT * FROM EVENT WHERE event_date BETWEEN TRUNC(SYSDATE) AND trunc(sysdate) + interval '1' day - interval '1' second",
      );
    }
  } else if (time === 'past') {
    if (search) {
      getEvents = await connection.execute(
        `SELECT * FROM EVENT WHERE name LIKE :newSearch AND 
        event_date < TRUNC(SYSDATE) `,
        { newSearch },
      );
    } else {
      getEvents = await connection.execute(
        'SELECT * FROM EVENT WHERE event_date < TRUNC(SYSDATE)',
      );
    }
  } else if (time === 'future') {
    if (search) {
      getEvents = await connection.execute(
        `SELECT * FROM EVENT WHERE name LIKE :newSearch AND 
        event_date > trunc(sysdate) + interval '1' day - interval '1' second `,
        { newSearch },
      );
    } else {
      getEvents = await connection.execute(
        `SELECT * FROM EVENT WHERE event_date > trunc(sysdate) + interval '1' day - interval '1' second`,
      );
    }
  }

  if (!getEvents) return { message: 'Event not found' };
  const returnedEvents = [];
  for (let i = 0; i < getEvents.rows.length; i++) {
    const event = {};
    for (let j = 0; j < getEvents.metaData.length; j++) {
      event[getEvents.metaData[j].name.toLowerCase()] = getEvents.rows[i][j];
    }
    returnedEvents.push(event);
  }
  returnedEvents.sort((a, b) => {
    const fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
    return 0;
  });

  const page_number = Math.ceil(returnedEvents.length / 4);
  const events = returnedEvents.slice(offset, offset + limit);

  return { events, page_number };
}

export async function create(event: EventEntity): Promise<any> {
  const {
    name,
    description,
    event_date,
    event_time,
    is_official,
    club_id,
    location,
  } = event;

  const a = Math.floor(Math.random() * 4);
  const b = Math.floor(Math.random() * 4);
  let score = `${a}-${b}`;
  if (is_official === 'false') score = 'Finished';
  const newDate = `${event_date} ${event_time}`;
  const isOfficial =
    is_official === 'true' ? 'Official Event' : 'Training Event';

  const sql = `Insert INTO EVENT(id, name, description, event_date, is_official, club_id, location, score) 
    VALUES( :id, :name, :description, TO_TIMESTAMP( :newDate,'YYYY-MM-DD hh24:mi:ss'), :isOfficial, :club_id, :location, :score)`;
  const id = uuidv4();

  const data = {
    id,
    name,
    description,
    newDate,
    location,
    club_id,
    score,
    isOfficial,
  };

  const options = {
    autoCommit: true,
    bindDefs: {
      id: { type: oracledb.STRING, maxSize: 60 },
      name: { type: oracledb.STRING, maxSize: 60 },
      is_official: { type: oracledb.STRING, maxSize: 20 },
      event_date: { type: oracledb.DATE },
      club_id: { type: oracledb.STRING },
      location: { type: oracledb.STRING },
      description: { type: oracledb.STRING },
    },
  };
  const connection = await checkConnection();
  return await connection.execute(sql, data, options);
}

export async function update(event: EventEntity, id: string): Promise<any> {
  const {
    name,
    description,
    event_date,
    event_time,
    is_official,
    club_id,
    location,
  } = event;
  const isOfficial =
    is_official === 'true' ? 'Official Event' : 'Training Event';
  const score = 'Pending';
  const newDate = `${event_date} ${event_time}`;
  const sql = `UPDATE EVENT SET name= :name, description= :description, location= :location, is_official= :isOfficial,
  event_date= TO_TIMESTAMP( :newDate,'YYYY-MM-DD hh24:mi:ss'), score= :score, club_id= :club_id WHERE id= :id`;

  const data = {
    id,
    name,
    description,
    newDate,
    location,
    club_id,
    score,
    isOfficial,
  };

  const options = {
    autoCommit: true,
    bindDefs: {
      id: { type: oracledb.STRING, maxSize: 60 },
      name: { type: oracledb.STRING, maxSize: 60 },
      is_official: { type: oracledb.STRING, maxSize: 20 },
      event_date: { type: oracledb.DATE },
      club_id: { type: oracledb.STRING },
      location: { type: oracledb.STRING },
      description: { type: oracledb.STRING },
    },
  };
  const connection = await checkConnection();
  return await connection.execute(sql, data, options);
}

export async function remove(id: string): Promise<string> {
  const connection = await checkConnection();
  const sql = 'Delete FROM EVENT WHERE id= :id';
  const options = {
    autoCommit: true,
    bindDefs: {
      id: { type: oracledb.STRING, maxSize: 50 },
    },
  };
  return await connection.execute(sql, { id }, options);
}
