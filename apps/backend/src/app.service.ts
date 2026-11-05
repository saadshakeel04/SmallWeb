import { InjectConnection } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import mongoose, { type Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getHealth(): { status: 'ok' | 'error'; database: 'connected' | 'disconnected' } {
    const connected =
      this.connection.readyState === mongoose.STATES.connected;

    return {
      status: connected ? 'ok' : 'error',
      database: connected ? 'connected' : 'disconnected',
    };
  }
}
