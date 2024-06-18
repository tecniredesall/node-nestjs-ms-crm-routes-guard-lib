export interface IRealmConfig {
  appId: string;
  partitionKey: string;
  authToken: string;
  behavior: {
    type: string;
    timeOut: number;
    timeOutBehavior: string;
  };
}
