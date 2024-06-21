import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateQuery } from 'mongoose';
import { compare } from 'bcrypt';
import { User } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { GetUsersQueryDto } from './dto/get-users.dto';
import { Role } from '../common/enums/role.enum';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { Result } from '../common/interfaces/result.interface';
import { PartialUser } from './types/partial-user.type';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: PaginatedModel<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<PartialUser> {
    const user = await this.getUserByEmail(createUserDto.email);
    if (user) {
      throw new ConflictException('Email already exists');
    }
    const newUser = await this.userModel.create({
      ...createUserDto,
      isActive: true,
    });

    return {
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization,
      },
    };
  }

  getUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async getUserById(userId: string): Promise<PartialUser> {
    const user = await this.userModel.findById(userId, '-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async getUsers(query: GetUsersQueryDto): Promise<Result<User>> {
    const { search, page, limit } = query;
    return this.userModel.paginate(
      {
        ...(search && {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }),
      },
      {
        page,
        limit,
        projection: '-password -isActive',
      },
    );
  }

  async updateUserRole(userId: string, role: Role): Promise<PartialUser> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async updateUser(
    userId: string,
    update: UpdateQuery<User>,
  ): Promise<PartialUser> {
    const user = await this.userModel.findByIdAndUpdate(userId, update, {
      new: true,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async updatePassword(
    email: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatched = await compare(updatePasswordDto.password, user.password);
    if (!isMatched) {
      throw new BadRequestException('Invalid password');
    }

    user.password = updatePasswordDto.newPassword;
    await user.save();
  }
}
