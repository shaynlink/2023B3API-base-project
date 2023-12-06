import { Module, forwardRef } from '@nestjs/common';
import { ProjectUsersService } from './project-users.service';
import { ProjectUsersController } from './project-users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectUser } from './entities/project-user.entity';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectUser]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => ProjectsModule),
  ],
  controllers: [ProjectUsersController],
  providers: [ProjectUsersService],
  exports: [ProjectUsersService],
})
export class ProjectUsersModule {}
