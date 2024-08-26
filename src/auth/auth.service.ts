import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser, IUserRegister } from 'src/users/users.interface';
import { CreateUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private roleService: RolesService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValidPassword = await this.usersService.isValidPassword(
        pass,
        user.password,
      );

      if (isValidPassword) {
        const userRole = user.role as any;
        const tmp = await this.roleService.findOne(userRole._id);
        const userObj = {
          ...user.toObject(),
          permissions: tmp?.permissions ?? [],
        };
        return userObj;
      }
    }
    return null;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions } = user;
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
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT-REFRESH-EXPIRE_IN')), //milisecond
    });
    return {
      access_token: this.jwtService.sign(payload),
      user: { _id, name, email, role, permissions },
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
  async processNewToken(refreshToken: string, response: Response) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT-REFRESH-TOKEN_SECRET'),
      });

      let user = await this.usersService.findUserByToken(refreshToken);

      if (user) {
        // update refresh token
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'refresh token ',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };
        const refreshToken = this.createRefreshToken(payload);

        // update user with refresh token
        await this.usersService.updateUserToken(refreshToken, _id.toString());

        // get permissions
        const userRole = role as any;
        const tmp = await this.roleService.findOne(userRole._id);

        //set refresh token at cookies
        response.clearCookie('refresh_token');

        response.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT-REFRESH-EXPIRE_IN')), //milisecond
        });
        return {
          access_token: this.jwtService.sign(payload),
          user: { _id, name, email, role, permissions: tmp?.permissions ?? [] },
        };
      } else {
        throw new BadRequestException('Refresh token không hợp lệ');
      }
    } catch (error) {
      throw new BadRequestException('Refresh token không hợp lệ');
    }
  }
  logout = (user: IUser, response: Response) => {
    this.usersService.updateUserToken(null, user._id);
    response.clearCookie('refresh_token');
    return 'done';
  };

  async getAccount(user: IUser) {
    let list = (await this.roleService.findOne(user.role._id)) as any;
    user.permissions = list?.permissions ?? [];
    return { user };
  }
}
