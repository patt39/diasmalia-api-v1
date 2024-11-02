import { Contact, Faq } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetFaqsSelections = {
  pagination?: PaginationType;
};

export type GetOneFaqSelections = {
  faqId: Contact['id'];
};

export type UpdateFaqsSelections = {
  faqId: Contact['id'];
};

export type CreateFaqsOptions = Partial<Faq>;

export type UpdateFaqsOptions = Partial<Faq>;

export const FaqsSelect = {
  createdAt: true,
  id: true,
  title: true,
  description: true,
};
