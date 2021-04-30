import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from 'src/services/users/user.service';

@Controller('users')
export class AuthController {
  constructor(
    private readonly appService: UserService,
    private userService: UserService,
  ) {}

  @Get()
  async getUser(): Promise<string> {
    return await this.userService.findOne('aaa');
  }

  @Post('createUser')
  async createUser(@Body() data): Promise<string> {
    return this.userService.create(data);
  }
}
