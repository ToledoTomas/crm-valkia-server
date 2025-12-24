import { Body, Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { HttpCode, HttpStatus, Post } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() data: UserDto) {
    return this.userService.createUserService(data);
  }
}
