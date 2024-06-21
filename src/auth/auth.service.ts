import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LogService } from '../log/log.service';
import { LoginDto } from './dto/login.dto';
import { Action } from '../log/enums/action.enum';
import { LoginSuccess } from './types/login-success.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
  ) {}

  async login(loginDto: LoginDto, userAgent: string): Promise<LoginSuccess> {
    const user = await this.userService.getUserByEmail(loginDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.isActive) {
      throw new BadRequestException('Your account is not active yet!');
    }

    await this.logService.createLog(user.id, {
      action: Action.LOGGED_IN,
      userAgent,
    });

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      token,
    };
  }

  async logout(user: string, userAgent: string): Promise<void> {
    await this.logService.createLog(user, {
      action: Action.LOGGED_OUT,
      userAgent,
    });
  }
}
