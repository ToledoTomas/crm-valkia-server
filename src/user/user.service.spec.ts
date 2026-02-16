import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUserService', () => {
    it('should create and save a new user with hashed password', async () => {
      const userDto: UserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const userWithHashedPassword = {
        email: userDto.email,
        password: 'hashedPassword',
      };
      const savedUser = { id: 1, ...userWithHashedPassword };

      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await service.createUserService(userDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userDto.email,
          password: 'hashedPassword',
        }),
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith(savedUser);
      expect(result).toEqual(savedUser);
    });
  });

  describe('getUserByEmailService', () => {
    it('should return a user if found', async () => {
      const email = 'test@example.com';
      const user = { id: 1, email, password: 'password' };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.getUserByEmailService(email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      const email = 'notfound@example.com';

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.getUserByEmailService(email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeNull();
    });
  });
});
