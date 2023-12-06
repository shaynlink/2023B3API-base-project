import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Req,
  HttpException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { RoleEnum, ValidateEnum } from '../types/generic';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  @Post()
  create(@Req() req, @Body() createEventDto: CreateEventDto) {
    const { userId } = req.user;

    return this.eventsService.create(createEventDto, userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':id/validate')
  validate(@Req() req, @Param('id') id: string) {
    const { role, userId } = req.user;

    if (role === RoleEnum.Employee) {
      throw new HttpException(
        'You are not allowed to validate events',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.eventsService.validateEvent(
      ValidateEnum.Validate,
      id,
      role,
      userId,
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':id/decline')
  decline(@Req() req, @Param('id') id: string) {
    const { role, userId } = req.user;

    if (role === RoleEnum.Employee) {
      throw new HttpException(
        'You are not allowed to validate events',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.eventsService.validateEvent(
      ValidateEnum.Decline,
      id,
      role,
      userId,
    );
  }
}
