import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    createUserService: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userDto: UserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const savedUser = { id: 1, ...userDto };

      mockUserService.createUserService.mockResolvedValue(savedUser);

      const result = await controller.register(userDto);

      expect(mockUserService.createUserService).toHaveBeenCalledWith(userDto);
      expect(result).toEqual(savedUser);
    });
  });
});
