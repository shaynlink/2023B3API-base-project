import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SignUpData, LoginData } from '../types/response';
import { SignUpDto, LoginDto } from './dto/users.dto';
import { JwtService } from '@nestjs/jwt';
import { EventsService } from '../events/events.service';
import { calculateMealVoucher } from '../utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject(forwardRef(() => EventsService))
    private eventsService: EventsService,
  ) {}

  private async findOneByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User> {
    return await this.usersRepository.findOne({
      where: [{ email }, { username }],
    });
  }

  public async signUp(signUpDto: SignUpDto): Promise<SignUpData> {
    const userExist = await this.findOneByEmailOrUsername(
      signUpDto.email,
      signUpDto.username,
    );

    if (userExist) {
      throw new HttpException(
        'User already exists',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const hash = await bcrypt.hash(signUpDto.password, 10);

    const user = this.usersRepository.create({
      username: signUpDto.username,
      email: signUpDto.email,
      password: hash,
      role: signUpDto.role,
    });

    try {
      const insertedResult = await this.usersRepository.save(user);

      return {
        id: insertedResult.id,
        username: signUpDto.username,
        email: signUpDto.email,
        role: signUpDto.role ?? insertedResult.role,
      };
    } catch (e) {
      throw new HttpException(
        (<Error>e).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: {
        password: true,
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }

    return user;
  }

  public async logIn({ email, password }: LoginDto): Promise<LoginData> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  public findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });
  }

  public async findOneById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  public async getMealVouchers(userId: string, month: number) {
    const events = await this.eventsService.findByUser(userId, { month });

    const count = events.length;

    console.log('month', month);
    console.log('count', count);

    const mealVouchers = calculateMealVoucher(month - 1, count);

    return mealVouchers;
  }
}
