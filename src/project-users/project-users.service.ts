import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectUser } from './entities/project-user.entity';
import {
  FindManyOptions,
  FindOptionsRelations,
  FindOptionsSelect,
  Repository,
} from 'typeorm';
import { CreateProjectUserDto } from './dto/project-user.dto';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { Ranges, hasDateRangeOverlaps } from '../utils';
import { Project } from '../projects/entities/project.entity';
import { Role, RoleEnum } from '../types/generic';

@Injectable()
export class ProjectUsersService {
  constructor(
    @InjectRepository(ProjectUser)
    private projectUsersRepository: Repository<ProjectUser>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => ProjectsService))
    private projectService: ProjectsService,
  ) {}

  public async create(
    createProjectUserDto: Readonly<CreateProjectUserDto>,
    userId: string,
    role: Role,
  ): Promise<ProjectUser> {
    const user = await this.usersService.findOneById(
      createProjectUserDto.userId,
    );
    const project = await this.projectService.findOne(
      createProjectUserDto.projectId,
      userId,
      role,
      true,
    );

    const projectAssignedToUser: ProjectUser[] = await this.findByUser(
      createProjectUserDto.userId,
      {
        user: true,
        project: {
          referringEmployee: true,
        },
      },
      {},
    );

    const rangesDate: Ranges<Date> = projectAssignedToUser.map(
      ({ startDate, endDate }) => [startDate, endDate],
    );
    rangesDate.push([
      new Date(createProjectUserDto.startDate),
      new Date(createProjectUserDto.endDate),
    ]);

    const hasConflictWithDateRangeOverlaps = hasDateRangeOverlaps(rangesDate);

    if (hasConflictWithDateRangeOverlaps) {
      throw new ConflictException(
        'Project already assigned to user in this date range',
      );
    }

    const projectUser =
      this.projectUsersRepository.create(createProjectUserDto);

    try {
      const projectUserSaved = await this.projectUsersRepository
        .save(projectUser)
        .then((projectUserResult) => {
          projectUserResult.user = user;
          projectUserResult.project = project;
          return projectUserResult;
        });

      return projectUserSaved;
    } catch (e) {
      throw new InternalServerErrorException((<Error>e).message);
    }
  }

  public async findByUser(
    userId: string,
    relations: FindOptionsRelations<ProjectUser>,
    select: FindOptionsSelect<ProjectUser>,
  ): Promise<ProjectUser[]> {
    return this.projectUsersRepository.find({
      where: { userId },
      relations,
      select,
    });
  }

  public findAll(userId: string, role: Role): Promise<Project[]> {
    const findOpt: FindManyOptions<ProjectUser> = {
      relations: {
        project: true,
      },
    };

    if (role === RoleEnum.Employee) {
      findOpt.where = { userId };
    }

    return this.projectUsersRepository
      .find(findOpt)
      .then((projectUsers) => projectUsers.map(({ project }) => project))
      .catch(() => {
        return [];
      });
  }

  public async findOne(id: string): Promise<ProjectUser> {
    const projectUser = await this.projectUsersRepository.findOne({
      where: { id },
    });

    if (!projectUser) {
      throw new NotFoundException('Project not found');
    }

    return projectUser;
  }

  public async findOneByProject(projectId: string): Promise<ProjectUser[]> {
    const projectUsers = await this.projectUsersRepository.find({
      where: { project: { id: projectId } },
      relations: {
        project: true,
      },
    });

    if (!projectUsers) {
      throw new NotFoundException('Project not found');
    }

    return projectUsers;
  }

  public getProjectByUser(userId: string): Promise<ProjectUser[]> {
    return this.projectUsersRepository.find({
      where: { userId },
    });
  }

  public getProjectByRefferingEmployee(
    referringEmployeeId: string,
    userId: string,
  ): Promise<ProjectUser> {
    return this.projectUsersRepository.findOne({
      where: { project: { referringEmployeeId }, userId },
      relations: {
        project: true,
      },
    });
  }
}
