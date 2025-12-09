import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { StudentJWTPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class StudentJWTStrategy extends PassportStrategy(
  Strategy,
  'student-jwt',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.STUDENT_JWT_SECRET_KEY as any,
    });
  }

  async validate(payload: StudentJWTPayload){
    return payload;
  }
}
