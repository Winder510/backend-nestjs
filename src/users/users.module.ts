import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { RolesService } from 'src/roles/roles.service';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, RolesService],
  exports: [UsersService],
})
export class UsersModule {}
