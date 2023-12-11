import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users/users.controller';
import { JwtStrategy } from './jwt.strategy';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ProjectUsersModule } from './project-users/project-users.module';
import { EventsModule } from './events/events.module';
import { TasksModule } from './tasks/tasks.module';

// Entities
import { User } from './users/entities/user.entity';
import { Project } from './projects/entities/project.entity';
import { ProjectUser } from './project-users/entities/project-user.entity';
import { Event } from './events/entities/event.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Project, ProjectUser, Event],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    TasksModule,
    UsersModule,
    ProjectsModule,
    ProjectUsersModule,
    EventsModule,
  ],
  controllers: [UsersController],
  providers: [JwtStrategy],
})
export class AppModule {}
