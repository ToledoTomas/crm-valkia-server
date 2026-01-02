import { IsString, IsEmail } from 'class-validator';

export class UserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
