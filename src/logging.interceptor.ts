import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const {
      url,
      params,
      query,
      headers: { host },
    } = request;

    const getStrFromObject = (key, obj) => {
      return Object.values(obj).length > 0
        ? `| ${key} ${Object.entries(obj).map(([k, v]) => `${k}=${v}`)}`
        : '';
    };

    const str = `[${new Date().toISOString()}] ip: ${host} > ${url} ${getStrFromObject(
      'params',
      params,
    )} ${getStrFromObject('query', query)}\n`;

    return next.handle().pipe(
      tap(() => {
        fs.writeFileSync(
          path.resolve(path.join(__dirname, '..', 'log.txt')),
          str,
          {
            flag: 'a',
          },
        );
      }),
    );
  }
}
