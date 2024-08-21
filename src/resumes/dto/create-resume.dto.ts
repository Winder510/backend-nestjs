import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty({ message: ' Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: ' userId không được để trống' })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'url được để trống' })
  url: string;

  @IsNotEmpty({ message: 'status không được để trống' })
  status: string; // PENDING-REVIEWING-APPROVED-REJECTED

  @IsNotEmpty({ message: ' companyId không được để trống' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'jobId không được để trống' })
  jobId: mongoose.Schema.Types.ObjectId;
}
export class CreateUserCvDto {
  @IsNotEmpty({ message: ' url không được để trống' })
  url: string;

  @IsNotEmpty({ message: ' companyId không được để trống' })
  @IsMongoId({ message: 'companyId không hợp lệ' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: ' JobId không được để trống' })
  @IsMongoId({ message: 'JobId không hợp lệ' })
  jobId: mongoose.Schema.Types.ObjectId;
}
