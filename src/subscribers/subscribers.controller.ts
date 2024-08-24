import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import {
  ResponseMessage,
  SkipCheckPermission,
  User,
} from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @ResponseMessage('Create a new subcriber')
  @Post()
  create(@Body() createSubcriberDto: CreateSubscriberDto, @User() user: IUser) {
    return this.subscribersService.create(createSubcriberDto, user);
  }

  @Get()
  @ResponseMessage('Fetch subcriber with paginate')
  findAll(
    @Query('current') page: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.subscribersService.findAll(+page, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Get subcriber by id')
  findOne(@Param('id') id: string) {
    return this.subscribersService.findOne(id);
  }

  @Post('skills')
  @ResponseMessage('Get subcriber skills')
  @SkipCheckPermission()
  getUserSkill(@User() user: IUser) {
    return this.subscribersService.getSkills(user);
  }

  @Patch()
  @ResponseMessage('Update a subcriber')
  @SkipCheckPermission()
  update(
    @Body() updateSubscriberDto: UpdateSubscriberDto,
    @User() user: IUser,
  ) {
    return this.subscribersService.update(updateSubscriberDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a subcriber')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.subscribersService.remove(id, user);
  }
}
