import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './controllers/users/user';
import { UserService } from './services/users/user.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PlayerController } from './controllers/player/player';
import { PlayerService } from './services/players/player.service';
import { CLubController } from './controllers/clubs/club';
import { ClubService } from './services/clubs/club.service';
import { EventController } from './controllers/event/event';
import { EventService } from './services/events/event.service';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [
    AppController,
    UserController,
    PlayerController,
    CLubController,
    EventController,
  ],
  providers: [
    AppService,
    UserService,
    PlayerService,
    ClubService,
    EventService,
  ],
})
export class AppModule {}
