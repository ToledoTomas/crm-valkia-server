import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserDto } from '../user/dto/user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUserService = {
    getUserByEmailService: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loginService', () => {
    it('should return an access token for valid credentials', async () => {
      const userDto: UserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      const token = 'jwtToken';

      mockUserService.getUserByEmailService.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      mockJwtService.signAsync.mockResolvedValue(token);

      const result = await service.loginService(userDto);

      expect(mockUserService.getUserByEmailService).toHaveBeenCalledWith(
        userDto.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        userDto.password,
        user.password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
      expect(result).toEqual({ accessToken: token });
    });

    it('should throw an error if user is not found', async () => {
      const userDto: UserDto = {
        email: 'notfound@example.com',
        password: 'password',
      };

      mockUserService.getUserByEmailService.mockResolvedValue(null);

      await expect(service.loginService(userDto)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw an error if password is invalid', async () => {
      const userDto: UserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUserService.getUserByEmailService.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.loginService(userDto)).rejects.toThrow(
        'Invalid password',
      );
    });
  });
});
