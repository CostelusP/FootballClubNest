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
import { UserService } from 'src/services/users/user.service';
import { LoginUserDto } from 'src/services/users/userDto';

@Controller('users')
export class UserController {
  constructor(
    private readonly appService: UserService,
    private userService: UserService,
  ) {}

  @Get()
  async getUser(): Promise<string> {
    return await this.userService.findOne('aaa');
  }

  @Post('createUser')
  @HttpCode(200)
  async createUser(@Body() data): Promise<any> {
    return this.userService.create(data);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
    return await this.userService.login(loginUserDto);
  }

  @Get('coaches')
  @HttpCode(200)
  async getCoaches(@Query() data): Promise<string> {
    const { page, limit, search } = data;
    return await this.userService.getCoaches(page, limit, search);
  }

  @Delete('coach')
  @HttpCode(200)
  async deleteCoach(@Query() data): Promise<any> {
    const { id } = data;
    return await this.userService.delete(id);
  }

  @Put('editUser')
  @HttpCode(200)
  async updateUser(@Body() data, @Query() userId): Promise<any> {
    const { id } = userId;
    return this.userService.update(data, id);
  }

  @Get('getCoaches')
  @HttpCode(200)
  async getCoachesForClub(): Promise<string> {
    return await this.userService.getCoachesForClub();
  }
}
