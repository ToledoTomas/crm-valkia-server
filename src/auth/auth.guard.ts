import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      console.error('No token found. Authorization header:', authHeader);
      throw new UnauthorizedException('No token provided');
    }

    // Verificar si el token tiene el formato correcto (debe tener 3 partes separadas por puntos)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('Invalid token format. Token parts:', tokenParts.length);
      console.error('Token preview:', token.substring(0, 20) + '...');
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        email: string;
        sub: number;
      }>(token);
      (request as Request & { user: { email: string; sub: number } })['user'] =
        payload;
    } catch (error) {
      const errorName =
        error instanceof Error && 'name' in error
          ? (error as { name: string }).name
          : '';
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      console.error('JWT Verification failed:', {
        errorName,
        errorMessage,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 30) + '...',
      });

      if (errorName === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      if (errorName === 'JsonWebTokenError') {
        throw new UnauthorizedException(`Invalid token: ${errorMessage}`);
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
