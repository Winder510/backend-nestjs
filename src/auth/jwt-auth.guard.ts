import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException('Token không hợp lệ');
    }
    const request: Request = context.switchToHttp().getRequest();

    //

    const targetMethod = request.method;
    const targetEndPoint: string = request.route?.path;

    const permissions = user?.permissions ?? [];

    let isExist = permissions.find((permission) => {
      return (
        targetMethod === permission.method &&
        targetEndPoint === permission.apiPath
      );
    });

    if (targetEndPoint.startsWith('api/v1/auth')) {
      isExist = true;
    }

    if (!isExist) {
      throw new ForbiddenException('Bạn không có quyền truy cập trang này');
    }

    return user;
  }
}
