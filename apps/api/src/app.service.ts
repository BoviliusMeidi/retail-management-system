import { Injectable } from '@nestjs/common';
import { TraceLog } from './core/decorators/trace-log.decorator.js';

@Injectable()
export class AppService {
  @TraceLog()
  getHello(): string {
    return 'Hello World!';
  }
}
