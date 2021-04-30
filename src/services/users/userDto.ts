import { IsNotEmpty, IsEmail } from 'class-validator';

export class UserDto {
  @IsNotEmpty() id: string;
  @IsNotEmpty() user_name: string;
  @IsNotEmpty() @IsEmail() email_address: string;
}

export class LoginUserDto {
  @IsNotEmpty() readonly user_name: string;
  @IsNotEmpty() readonly password: string;
}

export class CreateUserDto {
  @IsNotEmpty() user_name: string;
  @IsNotEmpty() password: string;
  @IsNotEmpty() @IsEmail() email_address: string;
}
