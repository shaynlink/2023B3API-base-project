import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignUpDto, LoginDto } from './dto/users.dto';
import { LoginData, SignUpData } from '../types/response';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { LoggingInterceptor } from '../logging.interceptor';

@Controller('users')
@UseInterceptors(new LoggingInterceptor())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UsePipes(new ValidationPipe())
  @Post('auth/sign-up')
  signUp(@Body() signUpDto: SignUpDto): Promise<SignUpData> {
    return this.usersService.signUp(signUpDto);
  }

  @UsePipes(new ValidationPipe())
  @Post('auth/login')
  async logIn(@Body() logInDto: LoginDto): Promise<LoginData> {
    return this.usersService.logIn(logInDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    const { userId } = req.user;

    return this.usersService.findOneById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/meal-vouchers/:month')
  getMealVouchers(@Param('month') month: string, @Req() req) {
    const { userId } = req.user;

    return this.usersService.getMealVouchers(userId, +month);
  }
}
