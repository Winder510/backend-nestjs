import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty({ message: 'id không được để trống' })
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;
}
export class CreateUserDto {
  @IsNotEmpty({ message: 'Name không được để trống ' })
  name: string;

  @IsEmail({ message: 'email không đúng định dạng' })
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'password không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'age không được để trống' })
  age: string;

  @IsNotEmpty({ message: 'gender không được để trống' })
  gender: string;

  @IsNotEmpty({ message: 'address không được để trống' })
  address: string;

  @IsNotEmpty({ message: 'role không được để trống' })
  @IsMongoId({ message: 'role la mongo id' })
  role: string;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}
export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name không được để trống ' })
  name: string;

  @IsEmail({ message: 'email không đúng định dạng' })
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'password không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'age không được để trống' })
  age: string;

  @IsNotEmpty({ message: 'gender không được để trống' })
  gender: string;

  @IsNotEmpty({ message: 'address không được để trống' })
  address: string;
}
