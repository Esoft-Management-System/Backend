import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException();

    const token = auth.slice(7);
    const decoded: any = this.jwtService.decode(token);
    const secret =
      decoded?.role === 'admin'
        ? process.env.ADMIN_JWT_SECRET
        : process.env.STAFF_JWT_SECRET;

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret });
      if (payload.role !== 'admin') throw new ForbiddenException('Admins only');
      (req as any).user = payload;
      next();
    } catch (_e) {
      throw new ForbiddenException('Admins only');
    }
  }
}
