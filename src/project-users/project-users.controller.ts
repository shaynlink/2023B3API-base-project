import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectUsersService } from './project-users.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { CreateProjectUserDto } from './dto/project-user.dto';
import { RoleEnum } from '../types/generic';
import { LoggingInterceptor } from '../logging.interceptor';

@Controller('project-users')
@UseInterceptors(new LoggingInterceptor())
@UseGuards(JwtAuthGuard)
export class ProjectUsersController {
  constructor(private readonly projectUsersService: ProjectUsersService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Req() req, @Body() createProjectUserDto: CreateProjectUserDto) {
    const { role, userId } = req.user;

    if (role !== RoleEnum.Admin && role !== RoleEnum.ProjectManager) {
      throw new UnauthorizedException();
    }

    return this.projectUsersService.create(createProjectUserDto, userId, role);
  }

  @Get()
  findAll(@Req() req) {
    const { userId, role } = req.user;

    return this.projectUsersService.findAll(userId, role);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.projectUsersService.findOne(id);
  }
}
