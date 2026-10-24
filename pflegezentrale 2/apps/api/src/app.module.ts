import { DynamicModule, Global, Module } from '@nestjs/common';
import { ActivityService } from './activity/activity.service';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { RateLimiter } from './auth/rate-limiter';
import { CareAccessService } from './care/care-access.service';
import { CareController } from './care/care.controller';
import { CareService } from './care/care.service';
import { CONFIG, Config } from './config';
import { Db } from './db/db.service';
import { FamiliesController } from './families/families.controller';
import { FamiliesService } from './families/families.service';

@Global()
@Module({})
export class AppModule {
  static register(config: Config): DynamicModule {
    return {
      module: AppModule,
      controllers: [AuthController, FamiliesController, CareController],
      providers: [
        { provide: CONFIG, useValue: config },
        Db, ActivityService, RateLimiter, AuthService, AuthGuard, CareAccessService, FamiliesService, CareService,
      ],
      exports: [Db, AuthService, RateLimiter],
    };
  }
}
