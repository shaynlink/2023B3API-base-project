import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role, RoleEnum } from '../../types/generic';

export class LoginDto {
  @IsString()
  @IsEmail(
    {},
    {
      message: 'email must be an email',
    },
  )
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class SignUpDto extends LoginDto {
  @IsString({
    message: 'username should not be empty',
  })
  @MinLength(3, {
    message: 'Username is too short, 3 charactres minimum',
  })
  username!: string;

  @IsOptional()
  @IsEnum([RoleEnum.Employee, RoleEnum.Admin, RoleEnum.ProjectManager])
  role?: Role;
}
