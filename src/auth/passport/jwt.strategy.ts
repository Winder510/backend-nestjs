import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT-ACCESS-TOKEN'),
    });
  }

  // nhan vao payload tu viec decode tu constructor
  async validate(payload: IUser) {
    const { _id, name, email, role } = payload;
    // req.user
    return {
      _id,
      name,
      email,
      role,
    };
  }
}
