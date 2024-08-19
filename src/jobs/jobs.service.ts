import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  async create(createJobDto: CreateJobDto, user: IUser) {
    let data = await this.jobModel.create({
      ...createJobDto,
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

  async findAll(page: string, limit: string, qs: string) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let offset = (+page - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel
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
    let data = await this.jobModel.findOne({
      _id: id,
    });
    return data;
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return await this.jobModel.updateOne(
        { _id: id },
        {
          ...updateJobDto,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      );
    }
  }

  async remove(id: string, user: IUser) {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      await this.jobModel.updateOne(
        { _id: id },
        {
          deletedBy: { _id: user._id, email: user.email },
        },
      );
      return this.jobModel.softDelete({ _id: id });
    } else {
      return 'Not found user';
    }
  }
}
