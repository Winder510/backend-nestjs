import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    if (await this.isExistName(createRoleDto.name)) {
      throw new BadRequestException('Name role bị trùng');
    }
    let data = await this.roleModel.create({
      ...createRoleDto,
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

  async findAll(page: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let offset = (+page - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.roleModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .select(projection as any)
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
      throw new BadRequestException('Trung ID');
    }
    let data = (await this.roleModel.findById(id)).populate({
      path: 'permissions',
      select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
    });
    return data;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return await this.roleModel.updateOne(
        {
          _id: id,
        },
        {
          ...updateRoleDto,
          updatedBy: {
            _id: user._id,
            email: user._id,
          },
        },
      );
    }
  }

  async remove(id: string, user: IUser) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const foundRole = await this.roleModel.findById(id);
      if (foundRole.name === 'ADMIN') {
        throw new BadRequestException('Không thể xóa role admin');
      }
      await this.roleModel.updateOne(
        { _id: id },
        {
          deletedBy: { _id: user._id, email: user.email },
        },
      );
      return this.roleModel.softDelete({ _id: id });
    } else {
      return 'Not found user';
    }
  }

  async isExistName(name: string) {
    return await this.roleModel.findOne({ name });
  }
}
