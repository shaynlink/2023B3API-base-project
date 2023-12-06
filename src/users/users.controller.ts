import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignUpDto, LoginDto } from './dto/users.dto';
import { LoginData, SignUpData } from '../types/response';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  @Post('auth/sign-up')
  signUp(@Body() signUpDto: SignUpDto): Promise<SignUpData> {
    return this.usersService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.CREATED)
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

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findOneById(id);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get(':id/meal-vouchers/:month')
  getMealVouchers(@Param('month') month: string, @Req() req) {
    const { userId } = req.user;

    return this.usersService.getMealVouchers(userId, +month);
  }
}
