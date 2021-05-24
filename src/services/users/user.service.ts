import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto, LoginUserDto } from './userDto';
import { UserEntity } from './userEntity';
import {
  findByEmail,
  create,
  find,
  remove,
  update,
  getAllCoaches,
} from './userOrm';

@Injectable()
export class UserService {
  constructor(private authService: AuthService) {}

  async findOne(email: string): Promise<UserEntity | any> {
    const user = await findByEmail(email);
    if (user === undefined) {
      return null;
    }
    if ('message' in user) {
      return { message: user.message };
    }
    const returnedUser = {
      id: '',
      user_name: '',
      password: '',
      email_address: '',
      is_admin: '',
    };
    if (user?.rows.length) {
      for (let i = 0; i < user.metaData.length; i++) {
        returnedUser[user.metaData[i].name.toLowerCase()] = user.rows[0][i];
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

  async login(userData: LoginUserDto): Promise<any> {
    const { email_address, password } = userData;
    const userExist = await this.findOne(email_address);
    if (!userExist) {
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    }
    if ('message' in userExist) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }
    const verifyPassword = await this.authService.comparePasswords(
      password,
      userExist.password,
    );
    if (!verifyPassword) {
      throw new HttpException('Invalid password', HttpStatus.NOT_FOUND);
    }
    delete userExist.password;
    const jwt = await this.authService.generateJwt(userExist);
    if (!jwt) {
      throw new HttpException('Invalid user', HttpStatus.UNAUTHORIZED);
    }
    return { message: 'User logged in', access_token: jwt, token_type: 'JWT' };
  }

  async getCoaches(page: number, limit: number, search: string): Promise<any> {
    const offset = (page - 1) * limit;
    const { coaches, page_number } = await find(offset, limit, search);
    return { coaches, page_number };
  }

  async delete(id: string): Promise<any> {
    if (!id) return { message: 'Invalid user id' };
    const userDeleted = await remove(id);
    if (userDeleted === undefined || !userDeleted) {
      throw new HttpException(
        'Creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (userDeleted && 'message' in userDeleted) {
      throw new HttpException(userDeleted.message, HttpStatus.BAD_REQUEST);
    }
    return { message: 'Deleted' };
  }

  async update(userData: CreateUserDto, id: string): Promise<any> {
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
    if (existUser?.rows.length && existUser.rows[0][0] !== id) {
      throw new HttpException('User exist', HttpStatus.NOT_FOUND);
    }

    const hashPassword = await this.authService.hashPassword(password);
    const createUserData = { hashPassword, ...userData };

    const userCreated = await update(createUserData, id);
    if (userCreated === undefined || !userCreated) {
      throw new HttpException(
        'Creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'User updated' };
  }

  async getCoachesForClub(): Promise<any> {
    const getCoaches = await getAllCoaches();
    if (!getCoaches && 'message' in getCoaches)
      throw new HttpException(
        getCoaches.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return getCoaches;
  }
}
