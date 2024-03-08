import { config } from '../config/index';
import { getCookieSettings } from './cookies.setting';
const cookieSettings = getCookieSettings(config.environment);

/*************** Setting user cookie *************************/
export const validation_login_cookie_setting = {
  maxAge: Number(config.cookie_access.user.accessExpireLogin),
  ...cookieSettings,
};

export const validation_verify_cookie_setting = {
  maxAge: Number(config.cookie_access.user.accessExpireVerify),
  ...cookieSettings,
};

export const expire_cookie_setting = {
  ...cookieSettings,
};
