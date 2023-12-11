import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { RoleEnum, ValidateEnum } from '../types/generic';
import { LoggingInterceptor } from '../logging.interceptor';

@Controller('events')
@UseInterceptors(new LoggingInterceptor())
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UsePipes(new ValidationPipe())
  @Post()
  create(@Req() req, @Body() createEventDto: CreateEventDto) {
    const { userId } = req.user;

    return this.eventsService.create(createEventDto, userId);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post(':id/validate')
  validate(@Req() req, @Param('id') id: string) {
    const { role, userId } = req.user;

    if (role === RoleEnum.Employee) {
      throw new UnauthorizedException('You are not allowed to validate events');
    }

    return this.eventsService.validateEvent(
      ValidateEnum.Validate,
      id,
      role,
      userId,
    );
  }

  @Post(':id/decline')
  decline(@Req() req, @Param('id') id: string) {
    const { role, userId } = req.user;

    if (role === RoleEnum.Employee) {
      throw new UnauthorizedException('You are not allowed to validate events');
    }

    return this.eventsService.validateEvent(
      ValidateEnum.Decline,
      id,
      role,
      userId,
    );
  }
}
