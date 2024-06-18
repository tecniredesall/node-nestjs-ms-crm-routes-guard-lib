import { FilterValidation } from '@app/common/middleware/req-filterpaginate.middleware';

export const exampleValidation: FilterValidation = {
  allowlist: [/\.?slug/, /\.?_partitionKey/],
  denylist: [/\.?deleted_at/],
};
