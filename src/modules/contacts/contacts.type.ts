import { Contact } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetContactsSelections = {
  search?: string;
  pagination?: PaginationType;
};

export type GetOneContactSelections = {
  contactId: Contact['id'];
};

export type UpdateContactsSelections = {
  contactId: Contact['id'];
};

export type CreateContactsOptions = Partial<Contact>;

export type UpdateContactsOptions = Partial<Contact>;

export const contactsSelect = {
  createdAt: true,
  id: true,
  subject: true,
  description: true,
  userCreatedId: true,
  organizationId: true,
};
