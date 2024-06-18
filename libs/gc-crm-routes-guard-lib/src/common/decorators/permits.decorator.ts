import { Permit } from '../schemas/permits.enum';
import { SetMetadata } from '@nestjs/common';

export const PERMITS_KEY = 'permits';
export const Permits = (...permits: Permit[]) => SetMetadata(PERMITS_KEY, permits);
