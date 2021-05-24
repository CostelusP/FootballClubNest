/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PlayerEntity } from './playerEntity';
import {
  find,
  findOne,
  create,
  update,
  remove,
  getByClubId,
} from './playerOrm';

@Injectable()
export class PlayerService {
  constructor() {}

  async getPlayer(id: string): Promise<PlayerEntity | any> {
    if (!id) return { message: 'Invalid player id' };
    const getPlayer = await findOne(id);
    if (getPlayer && 'message' in getPlayer) {
      throw new HttpException(getPlayer.message, HttpStatus.NOT_FOUND);
    }
    return getPlayer;
  }

  async getPlayers(
    page: number,
    limit: number,
    search: string,
    id: any,
    isFrom: any,
    role: string,
    userId: string,
  ): Promise<any> {
    const offset = (page - 1) * limit;
    const { players, page_number } = await find(
      offset,
      limit,
      search,
      id,
      isFrom,
      role,
      userId,
    );
    if (players && 'message' in players) {
      throw new HttpException(players.message, HttpStatus.BAD_REQUEST);
    }
    return { players, page_number };
  }

  async create(playerData: PlayerEntity): Promise<any> {
    const {
      full_name,
      rating,
      salary,
      position,
      date_of_birth,
      weight,
      height,
      age,
    } = playerData;
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
        'Invalid credentials for players',
        HttpStatus.PARTIAL_CONTENT,
      );
    }
    const playerCreated = await create(playerData);
    if (playerCreated === undefined || !playerCreated) {
      throw new HttpException(
        'Creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: 'Player Created' };
  }

  async update(playerData: PlayerEntity, id: string): Promise<any> {
    const playerUpdated = await update(playerData, id);
    if (playerUpdated === undefined || !playerUpdated) {
      throw new HttpException(
        'Updation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: 'User updated' };
  }

  async delete(id: string): Promise<any> {
    if (!id) return { message: 'Invalid player id' };
    const playerDeleted = await remove(id);
    if (playerDeleted === undefined || !playerDeleted) {
      throw new HttpException(
        'Creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'Deleted' };
  }

  async getPlayersByClubId(clubId: string): Promise<any> {
    if (!clubId) {
      throw new HttpException('Invalid clubId', HttpStatus.BAD_REQUEST);
    }

    const players = await getByClubId(clubId);
    if (players && 'message' in players) {
      throw new HttpException(players.message, HttpStatus.BAD_REQUEST);
    }
    return players;
  }
}
