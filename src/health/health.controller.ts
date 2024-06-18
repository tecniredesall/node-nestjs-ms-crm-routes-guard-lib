import configuration from '@app/config/configuration';
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  MongooseHealthIndicator,
  HealthIndicatorFunction,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  private healthIndicators: HealthIndicatorFunction[] = [];
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: MongooseHealthIndicator,
  ) {
    this.healthIndicators.push(() =>
      this.http.pingCheck('health-check', 'https://www.grainchain.io'),
    );
    if (configuration.databases.default === 'mongo')
      this.healthIndicators.push(() => this.db.pingCheck('mongo-db'));
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check(this.healthIndicators);
  }
}
