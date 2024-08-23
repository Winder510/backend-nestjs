import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';

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

  async create(createUserDto: CreateUserDto, user: IUser) {
    const hashPassword = this.getHashPassword(createUserDto.password);
    const isExistEmail = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (isExistEmail) {
      throw new BadRequestException(`Email: ${createUserDto.email} đã tồn tại`);
    }
    let data = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      _id: data._id,
      createdAt: data.createdAt,
    };
  }
  async register(registerUserDto: RegisterUserDto) {
    const hashPassword = this.getHashPassword(registerUserDto.password);
    const isExistEmail = await this.userModel.findOne({
      email: registerUserDto.email,
    });
    if (isExistEmail) {
      throw new BadRequestException(
        `Email: ${registerUserDto.email} đã tồn tại`,
      );
    }
    let data = await this.userModel.create({
      ...registerUserDto,
      role: 'USER',
      password: hashPassword,
    });

    return {
      _id: data._id,
      createdAt: data.createdAt,
    };
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let offset = (+page - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();
    return {
      meta: {
        current: page, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      let user = await this.userModel
        .findOne({
          _id: id,
        })
        .select('-password')
        .populate({
          path: 'role',
          select: {
            name: 1,
            _id: 1,
          },
        });
      return user;
    } else {
      return 'Not found user';
    }
  }
  findOneByUsername(username: string) {
    return this.userModel.findOne({ email: username });
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne(
      { id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const foundUser = this.userModel.findById(id);
      if ((await foundUser).email === 'admin@gmail.com') {
        throw new BadRequestException('Không thể xóa tài khoản admin');
      }
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
  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      { _id },
      {
        refreshToken,
      },
    );
  };
  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken });
  };
}
