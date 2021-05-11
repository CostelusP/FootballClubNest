/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ClubEntity } from './clubEntity';
// import { PlayerEntity } from './playerEntity';
import { find, create, update, remove } from './clubOrm';

@Injectable()
export class ClubService {
  constructor() {}

  async getClubs(search: string): Promise<any> {
    const { clubs } = await find(search);
    if (clubs && 'message' in clubs) {
      throw new HttpException(clubs.message, HttpStatus.BAD_REQUEST);
    }
    return clubs;
  }

  async create(clubData: ClubEntity): Promise<any> {
    const {
      full_name,
      rating,
      salary,
      position,
      date_of_birth,
      weight,
      height,
      age,
    } = clubData;
    if (
      !full_name ||
      !rating ||
      !salary ||
      !position ||
      !date_of_birth ||
      !weight ||
      !height ||
      !age
    ) {
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
