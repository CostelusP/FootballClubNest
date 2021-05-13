/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ClubEntity } from './clubEntity';
// import { PlayerEntity } from './playerEntity';
import { find, create, update, remove, findOne } from './clubOrm';

@Injectable()
export class ClubService {
  constructor() {}

  async getClubs(search: string): Promise<any> {
    const clubs = await find(search);
    if (clubs && 'message' in clubs) {
      throw new HttpException(clubs.message, HttpStatus.BAD_REQUEST);
    }
    return clubs;
  }

  async getClub(id: string): Promise<any> {
    const club = await findOne(id);
    if (club && 'message' in club) {
      throw new HttpException(club.message, HttpStatus.BAD_REQUEST);
    }
    return club;
  }

  async create(clubData: ClubEntity): Promise<any> {
    const { name, description } = clubData;
    if (name || !description) {
      throw new HttpException(
        'Invalid credentials for the club',
        HttpStatus.PARTIAL_CONTENT,
      );
    }
    const clubCreated = await create(clubData);
    if (clubCreated === undefined || !clubCreated) {
      throw new HttpException(
        'Creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: 'Club Created' };
  }

  async update(clubData: ClubEntity, id: string): Promise<any> {
    const clubUpdated = await update(clubData, id);
    if (clubUpdated === undefined || !clubUpdated) {
      throw new HttpException(
        'Updation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: 'Club updated' };
  }

  async delete(id: string): Promise<any> {
    if (!id) return { message: 'Invalid club id' };
    const clubDeleted = await remove(id);
    if (clubDeleted === undefined || !clubDeleted) {
      throw new HttpException(
        'Creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'Deleted' };
  }
}
