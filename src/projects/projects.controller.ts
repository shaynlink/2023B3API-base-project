import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Req,
  HttpStatus,
  UnauthorizedException,
  HttpCode,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { RoleEnum } from '../types/generic';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  @Post()
  create(@Req() req, @Body() createProjectDto: CreateProjectDto) {
    const { role } = req.user;

    if (role !== RoleEnum.Admin) {
      throw new UnauthorizedException();
    }

    return this.projectsService.create(createProjectDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(@Req() req) {
    const { role, userId } = req.user;

    return this.projectsService.findAll(role, userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Req() req, @Param('id', new ParseUUIDPipe()) projectId: string) {
    const { userId, role } = req.user;

    return this.projectsService.findOne(projectId, userId, role);
  }
}
