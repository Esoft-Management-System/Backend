import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (_, rawJwt, done) => {
        try {
          const payload = JSON.parse(
            Buffer.from(rawJwt.split('.')[1], 'base64').toString('utf8'),
          ) as JwtPayload;

          let key: any;
          switch (payload.role) {
            case 'admin':
              key = process.env.ADMIN_JWT_SECRET;
              break;
            case 'staff':
              key = process.env.STAFF_JWT_SECRET;
              break;
            default:
              throw new Error('Invalid role for staff/admin JWT strategy');
          }
          done(null, key);
          
        } catch (err) {
          done(err, null as any);
        }
      },
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}
