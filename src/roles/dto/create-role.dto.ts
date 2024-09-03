import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';
import { Permission } from 'src/permissions/schemas/permission.schema';

export class CreateRoleDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  isActive: boolean;

  // @ArrayNotEmpty({ message: 'Permissions array cannot be empty' })
  // @ArrayMinSize(1, {
  //   message: 'Permissions array must have at least 1 element',
  // })
  // @ArrayMaxSize(10, {
  //   message: 'Permissions array must not have more than 10 elements',
  // })
  @IsArray()
  @IsMongoId({
    each: true,
    message: 'Each permission must be a valid ObjectId',
  })
  permissions: string[];
}
