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
export const nodeMailServiceAdapter = async (options: {
  description?: string;
  from: string;
  html: string;
  subject: string;
  to: string[];
  attachments?: any[];
}): Promise<any> => {
  let result: any = {};
  const { attachments, to, from, html, subject, description } = options;

  const mailOptions: EmailMessage = {
    from: `${config.datasite.name} <${from}>`, // sender address
    to,
    subject: subject,
    text: description,
    html: html,
    attachments,
  };

  result = await resend.emails.send({ ...mailOptions });
  console.log('response ====>', result);

  // if (config.environment === 'prod') {
  //   result = await resend.emails.send({ ...mailOptions });
  //   console.log('response ====>', result);
  // }

  // if (config.environment === 'dev') {
  //   const transporter = createTransport({
  //     host: config.implementations.mailSMTP.host,
  //     port: config.implementations.mailSMTP.port,
  //     secure: false, // true for 465, false for other ports
  //     auth: {
  //       user: config.implementations.mailSMTP.user, // generated ethereal user
  //       pass: config.implementations.mailSMTP.pass, // generated ethereal password
  //     },
  //     tls: {
  //       rejectUnauthorized: false,
  //     },
  //   });

  //   result = await transporter.sendMail({ ...mailOptions });
  //   console.log('response ====>', result);
  // }

  return result;
};
