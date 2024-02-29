import { config } from '../../app/config/index';

import { Resend } from 'resend';
const resend = new Resend(config.implementations.resendSMTP.apiKey);

export type EmailMessage = {
  from: string;
  to: string[];
  subject: string;
  replyTo?: string;
  html?: string;
  text: string;
  attachments?: any[];
};
export const sendEmail = async (options: {
  description?: string;
  html: string;
  subject: string;
  to: string[];
  attachments?: any[];
}): Promise<any> => {
  const { attachments, to, html, subject, description } = options;

  const mailOptions: EmailMessage = {
    from: `${config.datasite.name} <${config.implementations.resendSMTP.email}>`, // sender address
    to,
    subject: subject,
    text: description,
    html: html,
    attachments,
  };

  const response = await resend.emails.send({ ...mailOptions });

  console.log('response email send ====>', response);
  return response;
};
