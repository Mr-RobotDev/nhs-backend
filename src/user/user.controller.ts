import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { MediaService } from '../media/media.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserRoleDto } from './dto/update-role.dto';
import { GetUsersQueryDto } from './dto/get-users.dto';
import { ImageUploadPipe } from '../common/pipes/image.pipe';
import { IsObjectIdPipe } from '../common/pipes/objectid.pipe';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Account } from '../common/interfaces/account.interface';
import { Role } from '../common/enums/role.enum';
import { Folder } from '../common/enums/folder.enum';

@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
  ) {}

  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.OK)
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get('me')
  getMe(@CurrentUser() account: Account) {
    return this.userService.getUserById(account.sub);
  }

  @Roles(Role.ADMIN)
  @Get()
  getUsers(@Query() query?: GetUsersQueryDto) {
    return this.userService.getUsers(query);
  }

  @Roles(Role.ADMIN)
  @Patch(':user/update-role')
  updateUserRole(
    @Param('user', IsObjectIdPipe) user: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userService.updateUserRole(user, updateUserRoleDto.role);
  }

  @Put('profile')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePic(
    @CurrentUser() account: Account,
    @UploadedFile(new ImageUploadPipe()) file: Express.Multer.File,
  ) {
    const profile = await this.mediaService.uploadFile(
      file.buffer,
      file.originalname,
      Folder.PROFILES,
      file.mimetype,
      account.sub,
    );
    await this.userService.updateUser(account.sub, { profile });
    return { profile };
  }

  @Patch('update-user')
  updateUser(
    @CurrentUser() account: Account,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(account.sub, updateUserDto);
  }

  @Patch('update-password')
  updatePassword(
    @CurrentUser() account: Account,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(account.email, updatePasswordDto);
  }
}
