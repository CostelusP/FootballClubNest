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
import { EventService } from 'src/services/events/event.service';

@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  // @Get('club/:id')
  // async getClub(@Param() params): Promise<string> {
  //   const { id } = params;
  //   return await this.eventService.getClub(id);
  // }

  @Get('')
  async getEvents(@Query() data): Promise<string> {
    const { page, limit, search, time } = data;
    console.log(time);
    return await this.eventService.getEvents(page, limit, search, time);
  }

  @Post('createEvent')
  @HttpCode(200)
  async createEvent(@Body() data): Promise<any> {
    return this.eventService.create(data);
  }

  @Put('editEvent')
  @HttpCode(200)
  async updateEvent(@Body() data, @Query() eventId): Promise<any> {
    console.log(eventId);
    const { id } = eventId;
    return this.eventService.update(data, id);
  }

  @Delete('deleteEvent')
  @HttpCode(200)
  async deleteEvent(@Query() data): Promise<any> {
    const { id } = data;
    return await this.eventService.delete(id);
  }
}
