import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Put,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
  Render,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';

import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ApiTags } from '@nestjs/swagger';

import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { ResponseInterceptor } from './../common/interceptor/response.interceptor';

import { FilterPaginate } from './../common/decorators/req-filterpaginate.decorator';
import { FilterPaginationQuery } from './../common/middleware/req-filterpaginate.middleware';
import { PageDto } from './../common/dtos';
import { IExample } from './interfaces';
import UserDto from '../auth0/dto/user.dto';
import { exampleValidation } from './schemas/example.validation';
import { DataParser } from '@app/common/decorators/data.parser.decorator';
import { DataValidationPipe } from '@app/common/pipes/data.validation.pipe';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { Roles } from '@app/common/decorators/roles.decorator';
import { Role } from '@app/common/schemas/role.enum';
import { CacheService } from '@app/cache/cache.service';
import { OTPGuard } from '@app/common/guards/otp.guard';
import { OTP } from '@app/common/decorators/otp.decorator';
import { AuthGuard } from '@nestjs/passport';
import { OTPNotification } from '@app/notifications/example/otp.notification';
import { Auth } from '@app/common/decorators/auth.decorator';
import { Permit } from '../../libs/gc-crm-routes-guard-lib/src/common/schemas/permits.enum';
import { PermitsGuard } from '../../libs/gc-crm-routes-guard-lib/src/common/guards/permits.guard';
import { Permits } from '../../libs/gc-crm-routes-guard-lib/src/common/decorators/permits.decorator.js';


@Controller('example')
@UseGuards(RolesGuard, PermitsGuard)
@ApiTags('example')
@Auth()
@UseInterceptors(ResponseInterceptor)
//@UseGuards(AuthGuard('jwt'))
export class ExampleController {
  constructor(
    private readonly exampleService: ExampleService,
    private cacheService: CacheService,
    private notification: OTPNotification,
  ) {}
  @Get('mails')
  async sendMails(@Res() res: Response) {
    await this.notification.send({
      email: 'manueltoala@grainchain.dev',
      subject: 'DigiBarter envia a você seu código OTP',
      payload: {
        code: '123456',
      },
    });
    res.json({ id: 1 });
  }
  //@UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @DataParser()
    @Body(DataValidationPipe)
    createExampleDto: CreateExampleDto,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = <UserDto>req.user;
    return this.exampleService.create(createExampleDto);
  }
  @UseGuards(OTPGuard)
  @OTP()
  @Get('otp-validate')
  async cache() {
    await this.cacheService.set('example', JSON.stringify({ examples: 112 }));
    const result = await this.cacheService.get('amanus');
    return { key: 'as12121as1212', location: 'dev/example', result: result };
  }

  @Roles(Role.Buyer)
  @Get('/test-route-guard')
  testRouteGuardResponses() {
    return { key: 'as12121as1212', location: 'dev/example' };
  }

  @Permits(Permit.AdminTrumodity)
  @Get('/test-route-guard-permits')
  testRouteGuardPermitResponses() {
    return { key: Permit.AdminTrumodity, location: 'dev/example' };
  }

  @Get('/test-idempotence-response')
  testIdempotenceResponses() {
    return { key: 'as12121as1212', location: 'dev/example' };
  }

  @Get('/test-ok-response')
  testOkResponses() {
    return [
      {
        _id: '3',
        first_name: 'Fernando Andres',
        last_name: 'Colmenares Sotomayor',
        date_of_birth: '2015-05-22',
        email: 'sotocol91@gamil.com',
        _links: {
          farms: 'people/3/farms',
          blocks: 'people/3/blocks',
        },
      },
      {
        _id: '4',
        first_name: 'Maria Carolina',
        last_name: 'Gomez Urrutia',
        date_of_birth: '2002-01-11',
        email: 'urrutiagom02@hotmail.com',
        _links: {
          farms: 'people/4/farms',
          blocks: 'people/4/blocks',
        },
      },
    ];
  }

  @Get('/test-error-response')
  testErrorResponses() {
    return {
      statusCode: 403,
      errors: [
        {
          internal_code: 'silosys-00001',
          title: 'Invalid Attribute',
          detail: 'First name must contain at least three characters.',
        },
      ],
    };
  }

  @Get('/test-exception-response')
  testExceptionResponses() {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject('Test error'), 2000);
    });
  }

  @Get('/test-exception2-response')
  testException2Responses() {
    throw new HttpException('Custom Exception Error', HttpStatus.BAD_REQUEST);
  }

  @Get()
  findAll() {
    return this.exampleService.findAll();
  }

  //if you need to use prism uncomment
  //@Get('prisma')
  //findPrisma() {
  //  return this.exampleService.findPrisma();
  //}

  @Get('query')
  async filterPagination(
    @FilterPaginate(exampleValidation) filter: FilterPaginationQuery,
  ): Promise<PageDto<IExample>> {
    return await this.exampleService.findPaginate(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exampleService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateExampleDto: UpdateExampleDto) {
    return this.exampleService.update(id, updateExampleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exampleService.remove(id);
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const location = await this.exampleService.uploadFile(file);

    return {
      location,
    };
  }
}
