import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdatedBy {
  @IsNotEmpty()
  _id: string;

  @IsNotEmpty()
  email: string;
}
class History {
  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  updated: Date;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdatedBy)
  updatedBy: UpdatedBy;
}

export class UpdateResumeDto extends PartialType(CreateResumeDto) {
  @Type(() => History)
  @ValidateNested()
  @IsNotEmpty()
  history: History[];
}
