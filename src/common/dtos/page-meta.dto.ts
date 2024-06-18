import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDtoParameters } from '../interfaces';

export class PageMetaDto {
  @ApiProperty()
  readonly total_pages: number;

  @ApiProperty()
  readonly total_elements: number;

  @ApiProperty()
  readonly page_number: number;

  @ApiProperty()
  readonly page_size: number;

  constructor({
    pageOptionsDto,
    total_elements,
    page_size,
  }: PageMetaDtoParameters) {
    this.page_size = page_size;
    this.page_number = pageOptionsDto.page === 0 ? 1 : pageOptionsDto.page;
    this.total_elements = total_elements;
    this.total_pages = Math.ceil(this.total_elements / this.page_size) || 0;
  }
}
