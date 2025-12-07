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
          const key =
            payload.role === 'admin'
              ? process.env.ADMIN_JWT_SECRET
              : process.env.STAFF_JWT_SECRET;
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
