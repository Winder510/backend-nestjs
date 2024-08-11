import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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
    console.log(data);
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

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
