import { config } from '../config/index';

/*************** Setting user cookie *************************/
export const validation_code_verification_cookie_setting = {
  maxAge: Number(config.cookie_access.user.firstStepExpire),
  httpOnly: true,
};

export const validation_login_cookie_setting = {
  maxAge: Number(config.cookie_access.user.accessExpire),
  httpOnly: true,
};

export const expire_cookie_setting = {
  httpOnly: true,
};
