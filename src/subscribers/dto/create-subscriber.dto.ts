import { IsNotEmpty } from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  skills: string[];
}
