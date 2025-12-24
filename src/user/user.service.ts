import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  async createUserService(userDto: UserDto) {
    const user = this.userRepository.create(userDto);
    return this.userRepository.save(user);
  }

  async getUserByEmailService(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}
