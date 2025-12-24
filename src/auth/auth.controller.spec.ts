import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserDto } from '../user/dto/user.dto';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    loginService: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return the result of authService.loginService', async () => {
      const userDto: UserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const expectedResult = { accessToken: 'jwtToken' };

      mockAuthService.loginService.mockResolvedValue(expectedResult);

      const result = await controller.login(userDto);

      expect(mockAuthService.loginService).toHaveBeenCalledWith(userDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should return the user from the request', () => {
      const user = { email: 'test@example.com', sub: 1 };
      const req = { user };

      const result = controller.getProfile(req);

      expect(result).toEqual(user);
    });
  });
});
