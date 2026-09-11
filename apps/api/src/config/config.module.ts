import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';

import { configuration } from './configuration';
import { validateEnvironment } from './env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), '../../.env'),
      ],
      load: [configuration],
      validate: validateEnvironment,
    }),
  ],
})
export class AppConfigModule {}
