import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto) {
    const hashPassword = this.getHashPassword(createUserDto.password);
    let data = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
    });

    return data;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return this.userModel.findOne({
        _id: id,
      });
    } else {
      return 'Not found user';
    }
  }
  findOneByUsername(username: string) {
    return this.userModel.findOne({ email: username });
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  async remove(id: string, user: IUser) {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      await this.userModel.updateOne(
        { _id: id },
        {
          deletedBy: { _id: user._id, email: user.email },
        },
      );
      return this.userModel.softDelete({ _id: id });
    } else {
      return 'Not found user';
    }
  }

  isValidPassword(password: string, hashPassword: string) {
    return compareSync(password, hashPassword);
  }
}
