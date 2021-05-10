import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PlayerService } from 'src/services/players/player.service';

@Controller('players')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  @Get('player')
  async getPlayer(@Query() data): Promise<string> {
    const { id } = data;
    return await this.playerService.getPlayer(id);
  }

  @Get('')
  async getPlayers(@Query() data): Promise<string> {
    const { page, limit, search } = data;
    return await this.playerService.getPlayers(page, limit, search);
  }

  @Post('createPlayer')
  @HttpCode(200)
  async createPlayer(@Body() data): Promise<any> {
    return this.playerService.create(data);
  }

  @Put('editPlayer')
  @HttpCode(200)
  async updatePlayer(@Body() data, @Query() playerId): Promise<any> {
    const { id } = playerId;
    return this.playerService.update(data, id);
  }

  @Delete('deletePlayer')
  @HttpCode(200)
  async deleteCoach(@Query() data): Promise<any> {
    const { id } = data;
    return await this.playerService.delete(id);
  }
}
