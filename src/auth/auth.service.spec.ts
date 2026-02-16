import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDto } from '../user/dto/user.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUserService = {
    getUserByEmailService: jest.fn(),
    createUserService: jest.fn(),
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

  afterEach(() => {
    jest.resetAllMocks();
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
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
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

    it('should throw UnauthorizedException if user is not found', async () => {
      const userDto: UserDto = {
        email: 'notfound@example.com',
        password: 'password',
      };

      mockUserService.getUserByEmailService.mockResolvedValue(null);

      await expect(service.loginService(userDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
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
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.loginService(userDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('registerService', () => {
    it('should create user and return access token', async () => {
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

      // First call (check if exists) returns null, second call (login) returns user
      mockUserService.getUserByEmailService
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(user);
      mockUserService.createUserService.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(token);

      const result = await service.registerService(userDto);

      expect(mockUserService.createUserService).toHaveBeenCalledWith(userDto);
      expect(result).toEqual({ accessToken: token });
    });

    it('should throw ConflictException if user already exists', async () => {
      const userDto: UserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUserService.getUserByEmailService.mockResolvedValue(existingUser);

      await expect(service.registerService(userDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
