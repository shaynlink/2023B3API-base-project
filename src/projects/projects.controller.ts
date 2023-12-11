import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { RoleEnum } from '../types/generic';
import { LoggingInterceptor } from '../logging.interceptor';

@Controller('projects')
@UseInterceptors(new LoggingInterceptor())
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UsePipes(new ValidationPipe())
  @Post()
  create(@Req() req, @Body() createProjectDto: CreateProjectDto) {
    const { role } = req.user;

    if (role !== RoleEnum.Admin) {
      throw new UnauthorizedException();
    }

    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(@Req() req) {
    const { role, userId } = req.user;

    return this.projectsService.findAll(role, userId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id', new ParseUUIDPipe()) projectId: string) {
    const { userId, role } = req.user;

    return this.projectsService.findOne(projectId, userId, role);
  }
}
