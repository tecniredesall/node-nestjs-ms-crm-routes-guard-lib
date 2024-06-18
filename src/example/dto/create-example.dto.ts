import { Transform, Type } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { toMongoObjectId } from '../../common/utils/StringConverter';

export class NamesDto {
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  _id: Types.ObjectId;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsString()
  @IsNotEmpty()
  value: string;
  @IsString()
  @IsNotEmpty()
  language: string;
}

export class CreateExampleDto {
  @Type(() => NamesDto)
  @IsNotEmpty()
  names: NamesDto[];
  @IsNotEmpty()
  @IsString()
  slug: string;
}
