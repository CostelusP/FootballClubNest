/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEntity } from './eventEntity';
import { create, find, remove, update } from './eventOrm';
// import { PlayerEntity } from './playerEntity';
// import { find, findOne, create, update, remove } from './playerOrm';

@Injectable()
export class EventService {
  constructor() {}

  async getEvents(
    page: number,
    limit: number,
    search: string,
    time: string,
  ): Promise<any> {
    const offset = (page - 1) * limit;

    const { events, page_number } = await find(offset, limit, search, time);
    if (events && 'message' in events) {
      throw new HttpException(events.message, HttpStatus.BAD_REQUEST);
    }
    return { events, page_number };
  }

  async create(eventData: EventEntity): Promise<any> {
    const {
      name,
      description,
      event_date,
      event_time,
      is_official,
      location,
    } = eventData;
    if (
      !name ||
      !description ||
      !event_date ||
      !event_time ||
      !is_official ||
      !location
    ) {
      throw new HttpException(
        'Invalid credentials for event',
        HttpStatus.PARTIAL_CONTENT,
      );
    }
    const eventCreated = await create(eventData);
    if (eventCreated === undefined || !eventCreated) {
      throw new HttpException(
        'Creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: 'Event Created' };
  }

  async update(eventData: EventEntity, id: string): Promise<any> {
    const eventUpdated = await update(eventData, id);
    if (eventUpdated === undefined || !eventUpdated) {
      throw new HttpException(
        'Updation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'Event updated' };
  }

  async delete(id: string): Promise<any> {
    if (!id) return { message: 'Invalid EVENT id' };
    const eventDeleted = await remove(id);
    if (eventDeleted === undefined || !eventDeleted) {
      throw new HttpException(
        `Can't delete event`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'Deleted' };
  }
}
