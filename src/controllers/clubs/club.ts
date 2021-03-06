import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  Param,
} from '@nestjs/common';
import { ClubService } from 'src/services/clubs/club.service';

@Controller('clubs')
export class CLubController {
  constructor(private clubService: ClubService) {}

  @Get('club/:id')
  async getClub(@Param() params): Promise<string> {
    const { id } = params;
    return await this.clubService.getClub(id);
  }

  @Get('')
  async getClubs(@Query() data): Promise<string> {
    const { search } = data;
    return await this.clubService.getClubs(search);
  }

  @Post('createClub')
  @HttpCode(200)
  async createClub(@Body() data): Promise<any> {
    return this.clubService.create(data);
  }

  @Put('editClub')
  @HttpCode(200)
  async updateClub(@Body() data, @Query() playerId): Promise<any> {
    const { id } = playerId;
    return this.clubService.update(data, id);
  }

  @Delete('deleteClub')
  @HttpCode(200)
  async deleteClub(@Query() data): Promise<any> {
    const { id } = data;
    return await this.clubService.delete(id);
  }

  @Get('getClubByUser')
  async getClubByUserId(@Query() data): Promise<string> {
    const { id } = data;
    return await this.clubService.getClubByUserId(id);
  }
}
