import { IsEnum, IsString } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  @IsString()
  role: Role;
}
