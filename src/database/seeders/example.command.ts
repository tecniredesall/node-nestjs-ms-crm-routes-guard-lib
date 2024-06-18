import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { ExampleService } from '@app/example/example.service';
@Injectable()
export class ExampleCommand {
  constructor(public readonly service: ExampleService) {}
  @Command({
    command: 'seed:example',
    describe: 'Create example',
  })
  async create() {
    console.log('Start import example');
    await this.import();
    console.log('Finish import example');

    process.exit(1);
  }
  async import() {
    const failed = [];
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const examples: any = require('./example/example.json');
    for (const item of examples) {
      try {
        await this.service.create(item).catch((e) => {
          console.error(e);
        });
      } catch (err) {
        failed.push(examples);
      }
    }
    if (failed)
      console.log(`Failed Importing `, JSON.stringify(failed, null, 3));
  }
}
