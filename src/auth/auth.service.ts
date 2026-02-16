import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
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
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const comparePasswords = await bcrypt.compare(data.password, user.password);
    if (!comparePasswords) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const payload = { email: user.email, sub: user.id };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  async registerService(data: UserDto) {
    const existingUser = await this.userService.getUserByEmailService(
      data.email,
    );
    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }
    await this.userService.createUserService(data);
    return this.loginService(data);
  }
}
