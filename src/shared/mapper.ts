import { UserDto } from '../services/users/userDto';
import { UserEntity } from '../services/users/userEntity';

export const toUserDto = (data: UserEntity): UserDto => {
  const { id, user_name, email_address } = data;
  const userDto: UserDto = { id, user_name, email_address };
  return userDto;
};
