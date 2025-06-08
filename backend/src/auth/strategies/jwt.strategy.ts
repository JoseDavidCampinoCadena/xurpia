import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });  }

  async validate(payload: any) {
    console.log('🔍 JWT Strategy - payload:', payload);
    // Return userId to match the expected user object structure across controllers
    const user = { userId: payload.userId, id: payload.userId };
    console.log('🔍 JWT Strategy - returning user:', user);
    return user;
  }
}