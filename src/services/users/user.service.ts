import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from './userDto';
import { UserEntity } from './userEntity';
import { findByEmail, create } from './userOrm';

@Injectable()
export class UserService {
  constructor(private authService: AuthService) {}

  async findOne(email: string): Promise<UserEntity | any> {
    const user = await findByEmail(email);
    if (user === undefined) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if ('message' in user) {
      throw new HttpException(user.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const returnedUser = {};
    if (user?.rows.length) {
      for (let i = 0; i < user.rows?.length; i++) {
        returnedUser[user.metaData[i]] = user.rows[i];
      }
    }
    return returnedUser;
  }

  async create(userData: CreateUserDto): Promise<any> {
    const { email_address, password } = userData;

    const existUser = await findByEmail(email_address);
    if (existUser === undefined) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if ('message' in existUser) {
      throw new HttpException(
        existUser.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    console.log(existUser);

    if (existUser?.rows.length) {
      throw new HttpException('User exist', HttpStatus.NOT_FOUND);
    }
    const hashPassword = await this.authService.hashPassword(password);
    const createUserData = { hashPassword, ...userData };

    const userCreated = await create(createUserData);
    if (userCreated === undefined || !userCreated) {
      throw new HttpException(
        'Creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'User Created' };
  }
}
