import { ApiProperty } from '@nestjs/swagger';

import { PageMetaDto } from '@app/common/dtos/page-meta.dto';

export class PageLinksDto {
  @ApiProperty()
  readonly self: string;

  @ApiProperty()
  readonly first: string;

  @ApiProperty()
  readonly prev: string;

  @ApiProperty()
  readonly next: string;

  @ApiProperty()
  readonly last: string;

  constructor(meta: PageMetaDto, base_url: string) {
    this.self = `${base_url}?page=${meta.page_number}`;
    this.first = `${base_url}?page=1`;
    const prev = meta.page_number - 1;
    this.prev = `${base_url}?page=${prev === 0 ? 1 : prev}`;
    const next = meta.page_number + 1;
    this.next = `${base_url}?page=${
      next <= meta.total_pages ? next : meta.total_pages
    }`;
    this.last = `${base_url}?page=${meta.total_pages}`;
  }
}
