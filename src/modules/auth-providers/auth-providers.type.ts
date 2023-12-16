import { AuthProvider } from '@prisma/client';

export type GetOneAuthProvidersSelections = {
  authProviderId?: AuthProvider['id'];
  email?: AuthProvider['email'];
  providerId?: AuthProvider['providerId'];
};

export type UpdateAuthProvidersSelections = {
  authProviderId?: AuthProvider['id'];
  email?: AuthProvider['email'];
  providerId?: AuthProvider['providerId'];
};

export type CreateAuthProvidersOptions = Partial<AuthProvider>;

export type UpdateAuthProvidersOptions = Partial<AuthProvider>;
