import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/services/users/userEntity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');
require('dotenv');

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateJwt(user: UserEntity): Promise<string> {
    return await this.jwtService.signAsync(
      { user },
      { secret: process.env.JWT_SECRET },
    );
  }

  hashPassword(password: string): string {
    return bcrypt.hash(password, 12);
  }

  comparePasswords(password: string, storedPasswordHash: string): any {
    console.log(password, storedPasswordHash);
    return bcrypt.compare(password, storedPasswordHash);
  }
}
