export interface CreateUserPoolClientParams {
  clientName: string;
}

export interface RemoveUserPoolClientParams {
  clientId: string;
}

export interface CreateUserPoolClientResult {
  clientId: string;
  clientSecret: string;
  clientName: string;
}

export interface GetClientAccessToken {
  clientId: string;
  clientSecret: string;
}
