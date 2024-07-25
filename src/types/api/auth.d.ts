interface RequestAuth {
  grant_type?: string;
  username: string;
  password: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

interface ResponseAuth {
  access_token: string;
  refresh_token: string;
  scopes: string[];
  token_type: string;
}