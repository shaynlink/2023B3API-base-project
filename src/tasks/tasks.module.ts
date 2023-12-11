import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { EventsModule } from '../events/events.module';
import { ProjectUsersModule } from '../project-users/project-users.module';

@Module({
  imports: [EventsModule, ProjectUsersModule],
  providers: [TasksService],
})
export class TasksModule {}
