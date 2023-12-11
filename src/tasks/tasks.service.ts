import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventsService } from '../events/events.service';
import { EventStatusEnum, EventTypeEnum } from '../types/generic';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import * as dayjs from 'dayjs';
import { Event } from '../events/entities/event.entity';
import { ProjectUsersService } from '../project-users/project-users.service';
import { ProjectUser } from '../project-users/entities/project-user.entity';
import { stringify as csvStringify } from 'csv-stringify/sync';
import * as fs from 'node:fs';

interface EventWithProjectUser extends Event {
  projectUser?: ProjectUser;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private eventsService: EventsService,
    private projectUsersService: ProjectUsersService,
  ) {}

  @Cron('0 0 0 28 * *')
  async handleCron() {
    const events: EventWithProjectUser[] = await this.eventsService
      .findAll({
        where: {
          eventStatus: EventStatusEnum.Accepted,
          eventType: EventTypeEnum.PaidLeave,
          date: Between(
            dayjs().startOf('month').toDate(),
            dayjs().endOf('month').toDate(),
          ),
        },
      })
      .then(async (events) => {
        return Promise.all(
          events.map(async (event: EventWithProjectUser) => {
            event.projectUser =
              await this.projectUsersService.findOneWithFindOptions({
                where: {
                  userId: event.userId,
                  startDate: LessThanOrEqual(event.date),
                  endDate: MoreThanOrEqual(event.date),
                },
                relations: {
                  project: true,
                  user: true,
                },
                select: {
                  id: true,
                  project: {
                    name: true,
                  },
                  user: {
                    username: true,
                  },
                },
              });

            return event;
          }),
        );
      });

    const csv = csvStringify([
      ['username', 'paid leave date', 'project'],
      ...events.map((event) => [
        event.projectUser.user.username,
        new Date(event.date).toDateString(),
        event.projectUser.project.name,
      ]),
    ]);

    fs.writeFileSync('paidLeave.csv', csv, {
      flag: 'w',
    });

    this.logger.debug(
      `CSV create with all month's leave paid > ${events.length} leave paids referenced`,
    );
  }
}
