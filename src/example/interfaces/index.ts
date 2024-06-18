export interface IExample {
  slug: string;
  names: any;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  tasks: any;
  _partitionKey: string;
}
