import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserDto } from '../user/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async loginService(data: UserDto) {
    const user = await this.userService.getUserByEmailService(data.email);
    if (!user) {
      throw new Error('User not found');
    }
    const comparePasswords = await bcrypt.compare(data.password, user.password);
    if (!comparePasswords) {
      throw new Error('Invalid password');
    }
    const payload = { email: user.email, sub: user.id };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
