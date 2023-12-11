import {
  Injectable,
  Inject,
  forwardRef,
  ForbiddenException,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/project.dto';
import { UsersService } from '../users/users.service';
import { Role, RoleEnum } from '../types/generic';
import { ProjectUsersService } from '../project-users/project-users.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => ProjectUsersService))
    private projectUsersService: ProjectUsersService,
  ) {}

  public async create(createProjectDto: CreateProjectDto) {
    const referringEmployee = await this.usersService.findOneById(
      createProjectDto.referringEmployeeId,
    );

    if (referringEmployee.role === RoleEnum.Employee) {
      throw new UnauthorizedException(
        'Referring employee must be an Admin or Project Manager',
      );
    }

    const project = this.projectsRepository.create(createProjectDto);

    try {
      const projectSaved = await this.projectsRepository
        .save(project)
        .then((project) => {
          project.referringEmployee = referringEmployee;
          return project;
        });

      return projectSaved;
    } catch (e) {
      throw new InternalServerErrorException((<Error>e).message);
    }
  }

  public findAll(role: Role, userId: string): Promise<Project[]> {
    if (role === RoleEnum.Employee) {
      return this.projectUsersService
        .findByUser(
          userId,
          { project: { referringEmployee: true } },
          {
            id: false,
            startDate: false,
            endDate: false,
            projectId: false,
          },
        )
        .then((projectUsers) => projectUsers.map(({ project }) => project));
    }

    return this.projectsRepository.find({
      relations: {
        referringEmployee: true,
      },
      select: {
        referringEmployee: {
          id: true,
          password: false,
          username: true,
          email: true,
          role: true,
        },
      },
    });
  }

  public async findOne(
    projectId: string,
    userId: string,
    role: Role,
    useRelation?: boolean,
  ): Promise<Project> {
    if (role === RoleEnum.Employee) {
      const projectUsers =
        await this.projectUsersService.findOneByProject(projectId);

      if (!projectUsers.some((projectUser) => projectUser.userId === userId)) {
        throw new ForbiddenException();
      }

      return projectUsers[0].project;
    }

    const findOpt: FindOneOptions<Project> = {
      where: { id: projectId },
    };

    if (useRelation) {
      findOpt.relations = {
        referringEmployee: true,
      };
    }

    const project = await this.projectsRepository.findOne(findOpt);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}
