import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser, IUserRegister } from 'src/users/users.interface';
import { CreateUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValidPassword = this.usersService.isValidPassword(
        pass,
        user.password,
      );

      if (isValidPassword) {
        return user;
      }
    }
    return null;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };
    const refreshToken = this.createRefreshToken(payload);

    // update user with refresh token
    await this.usersService.updateUserToken(refreshToken, _id);

    //set refresh token at cookies
    response.cookie('resfresh_token', refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT-REFRESH-EXPIRE_IN')), //milisecond
    });
    return {
      access_token: this.jwtService.sign(payload),
      user: { _id, name, email, role },
    };
  }
  async register(newUser: RegisterUserDto) {
    let data = await this.usersService.register({ ...newUser });

    return data;
  }
  createRefreshToken = (payload) => {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT-REFRESH-TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT-REFRESH-EXPIRE_IN')) / 1000,
    });
    return refreshToken;
  };
}
