import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const isExist = await this.isExistPermission(
      createPermissionDto.apiPath,
      createPermissionDto.method,
    );
    if (isExist) {
      throw new BadRequestException('Permission is exist');
    }

    const data = await this.permissionModel.create({
      ...createPermissionDto,
      createdBy: { _id: user._id, email: user.email },
    });
    return {
      id: data._id,
      createdAt: data.createdAt,
    };
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let offset = (+page - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel
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
    let data = await this.permissionModel.findOne({
      _id: id,
    });
    return data;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: IUser,
  ) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return await this.permissionModel.updateOne(
        { _id: id },
        {
          ...updatePermissionDto,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      );
    }
  }

  async remove(id: string, user: IUser) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      await this.permissionModel.updateOne(
        { _id: id },
        {
          deletedBy: { _id: user._id, email: user.email },
        },
      );
      return this.permissionModel.softDelete({ _id: id });
    } else {
      return 'Not found user';
    }
  }

  async isExistPermission(apiPath: string, method: string) {
    const data = await this.permissionModel.findOne({
      apiPath,
      method,
    });
    if (data) return true;
    else return false;
  }
}
