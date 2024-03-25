import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  /**
   * Url site
   */
  url: {
    allowedOrigins: process.env.ALLOWED_ORIGINS,
    client: process.env.NODE_CLIENT_URL,
    dashboard: process.env.NODE_DASHBOARD_URL,
  },
  /**
   * Node environment
   */
  environment: process.env.NODE_ENV || 'dev',
  /**
   * Cookie configuration
   */

  cookieKey: process.env.COOKIE_KEY || '@3%NE8IksyHK4yC5POFurDCAVW@FqxBe',
  cookie_access: {
    user: {
      nameLogin: process.env.COOKIE_NAME_LOGIN || 'x-user',
      accessExpireLogin: process.env.COOKIE_ACCESS_EXPIRE || '86400000000',
      nameVerify: process.env.COOKIE_NAME_LOGIN || 'x-verify-code',
      accessExpireVerify:
        process.env.COOKIE_VALIDATION_TOKEN_EXPIRE || '300000000000',
    },
  },
  /**
   * Site
   */
  datasite: {
    name: process.env.NODE_NAME,
    url: process.env.NODE_APP_URL,
    pricingBilling: Number(process.env.PRICING_BILLING_VOUCHER),
    urlClient: process.env.NODE_CLIENT_URL,
    email: process.env.MAIL_FROM_ADDRESS,
    daysOneMonth: Number(process.env.DAYS_ONE_MONTH_contributor),
    amountOneMonth: Number(process.env.AMOUNT_ONE_MONTH_contributor),
    emailNoreply: process.env.MAIL_FROM_NO_REPLAY_ADDRESS,
  },
  /**
   * Organization
   */
  organizationAddress: {
    name: 'LiveStock MGT',
    company: 'LiveStock MGT',
    street1: 'Via santa maria 17',
    street2: '',
    city: 'Vigevano',
    zip: '27029',
    country: 'IT',
    phone: '+393881155086',
    email: 'info@birevo.com',
  },
  /**
   * Api
   */
  api: {
    prefix: '/api',
    version: process.env.API_VERSION,
    headerSecretKey: process.env.HEADER_API_SECRET_KEY,
  },
  /**
   * Server port
   */
  port: process.env.PORT || 5500,
  /**
   * Database
   */
  database: {
    url: process.env.DATABASE_URL,
  },
  /**
   * Show or not console.log
   */
  showLog: true,
  /**
   * External implementations
   */
  implementations: {
    /**
     * Twilio
     */
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      verifySid: process.env.TWILIO_VERIFY_SID,
    },
    /**
     * Stripe
     */
    stripe: {
      privateKey: process.env.STRIPE_PRIVATE_KEY,
      publicKey: process.env.STRIPE_PUBLIC_KEY,
    },
    /**
     * Amqp
     */
    amqp: {
      link: process.env.AMQP_LINK,
    },
    /**
     * Ipapi
     */
    ipapi: {
      link: process.env.IPAPI_LINK,
      apiKey: process.env.IPAPI_KEY,
    },
    /**
     * Ip-api
     */
    ip_api: {
      link: process.env.IP_API_LINK,
    },
    /**
     * Sentry
     */
    sentry: process.env.SENTRY_DNS,
    /**
     * Mailtrap
     */
    mailSMTP: {
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
      email: process.env.MAIL_SMTP_EMAIL,
    },
    /**
     * Aws smtp
     */
    awsSMTP: {
      host: process.env.AWS_SMTP_HOST,
      port: Number(process.env.AWS_SMTP_PORT),
      user: process.env.AWS_SMTP_USERNAME,
      pass: process.env.AWS_SMTP_PASSWORD,
      email: process.env.AWS_SMTP_EMAIL,
    },
    /**
     * Resend smtp
     */
    resendSMTP: {
      apiKey: process.env.RESEND_SMTP_API_KEY,
      email: process.env.RESEND_SMTP_EMAIL,
    },
    /**
     * Mailtrap
     */
    mailjet: {
      apiKey: process.env.MJ_APIKEY_PUBLIC,
      apiSecret: process.env.MJ_APIKEY_PRIVATE,
    },
    /**
     * Amazon s3
     */
    aws: {
      bucket: process.env.AWS_BUCKET,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_ACCESS_SECRET_KEY,
      refreshToken: process.env.AWS_REFRESH_TOKEN,
      clientId: process.env.AWS_CLIENT_ID,
      clientSecret: process.env.AWS_CLIENT_SECRET,
      region: process.env.AWS_REGION_NAME,
      auth: {
        host: 'https://api.amazon.com',
      },
      sts: {
        host: 'sts.eu-central-1.amazonaws.com',
        service: 'sts',
      },
      cloudfront: {
        url: process.env.AWS_CLOUD_FRONT_URL,
      },
      executeApi: {
        host: 'sellingpartnerapi-eu.amazon.com',
        service: 'execute-api',
      },
    },
    /**
     * Google
     */
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
};
