import {
  Injectable,
  forwardRef,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import {
  Ranges,
  dateIncludeFromRanges,
  hasMoreThanPerWeek,
  hasSameDate,
} from '../utils';
import {
  EventStatusEnum,
  EventTypeEnum,
  RoleEnum,
  ValidateEnum,
} from '../types/generic';
import { ProjectUsersService } from '../project-users/project-users.service';
import * as dayjs from 'dayjs';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @Inject(forwardRef(() => ProjectUsersService))
    private projectUsersService: ProjectUsersService,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string) {
    const events = await this.eventsRepository.find({
      where: { userId },
      select: {
        date: true,
      },
    });

    const dates = events.map((event) => event.date);
    dates.push(new Date(createEventDto.date));

    if (hasSameDate(dates)) {
      throw new UnauthorizedException(
        'You can not have more than 1 event per day',
      );
    }

    if (hasMoreThanPerWeek(2, dates)) {
      throw new UnauthorizedException(
        'You can not have more than 5 events per week',
      );
    }

    const event = this.eventsRepository.create(createEventDto);
    event.userId = userId;

    if (createEventDto.eventType === EventTypeEnum.RemoteWork) {
      event.eventStatus = EventStatusEnum.Accepted;
    } else {
      event.eventStatus = EventStatusEnum.Pending;
    }

    try {
      const eventSaved = await this.eventsRepository.save(event);

      return eventSaved;
    } catch (e) {
      throw new InternalServerErrorException((<Error>e).message);
    }
  }

  findAll(): Promise<Event[]> {
    return this.eventsRepository.find();
  }

  findOne(id: string): Promise<Event> {
    return this.eventsRepository.findOne({
      where: { id },
    });
  }

  public findByUser(
    userId: string,
    { month }: { month: number },
  ): Promise<Event[]> {
    const startDate = dayjs()
      .month(month - 1)
      .startOf('month');
    const endDate = dayjs().month(month).endOf('month');

    return this.eventsRepository.find({
      where: {
        userId,
        date: Between(startDate.toDate(), endDate.toDate()),
      },
    });
  }

  async validateEvent(
    validate: ValidateEnum,
    id: string,
    role: RoleEnum,
    userId: string,
  ): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.eventStatus !== EventStatusEnum.Pending) {
      throw new UnauthorizedException('You can not validate this event');
    }

    const projectUsers = await this.projectUsersService.getProjectByUser(
      event.userId,
    );

    const rangesDate: Ranges<Date> = projectUsers.map((projectUser) => [
      projectUser.startDate,
      projectUser.endDate,
    ]);

    if (!dateIncludeFromRanges(event.date, rangesDate)) {
      throw new UnauthorizedException(
        'You can not validate this event, must be in project range',
      );
    }

    if (role === RoleEnum.ProjectManager) {
      const project =
        await this.projectUsersService.getProjectByRefferingEmployee(
          userId,
          event.userId,
        );

      if (!project) {
        throw new UnauthorizedException('You can not validate this event');
      }
    }

    event.eventStatus =
      validate === ValidateEnum.Validate
        ? EventStatusEnum.Accepted
        : EventStatusEnum.Declined;

    try {
      const eventSaved = await this.eventsRepository.save(event);

      return eventSaved;
    } catch (e) {
      throw new InternalServerErrorException((<Error>e).message);
    }
  }
}
