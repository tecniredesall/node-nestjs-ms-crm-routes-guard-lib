import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { PageMetaDto } from './page-meta.dto';
import { PageLinksDto } from './page-links.dto';

export class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto })
  readonly _meta: PageMetaDto;

  @ApiProperty({ type: () => PageLinksDto })
  readonly _links: PageLinksDto;

  constructor(data: T[], meta: PageMetaDto, links: PageLinksDto) {
    this.data = data;
    this._meta = meta;
    this._links = links;
  }
}
