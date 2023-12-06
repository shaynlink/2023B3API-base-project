import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectUsersService } from './project-users.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { CreateProjectUserDto } from './dto/project-user.dto';
import { RoleEnum } from '../types/generic';

@Controller('project-users')
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

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(@Req() req) {
    const { userId, role } = req.user;

    return this.projectUsersService.findAll(userId, role);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.projectUsersService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProjectUserDto: UpdateProjectUserDto) {
  //   return this.projectUsersService.update(+id, updateProjectUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.projectUsersService.remove(+id);
  // }
}
