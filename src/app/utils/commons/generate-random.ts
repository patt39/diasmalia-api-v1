import { murmurhash2_x86_32, murmurhash3_x64_128 } from 'number-generator';
import * as QRCode from 'qrcode';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

export const generateUUID = () => {
  return uuidv4();
};

export const generateQRCode = async (code: string) =>
  await QRCode.toDataURL(`http://localhost:4900/api/v1/animals/view/${code}`);

export const generateCouponCode = (length: number) => {
  let result = '';
  const generator = murmurhash3_x64_128(`${generateUUID}`);
  const characters =
    `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789${generator}`.toUpperCase();
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateLongUUID = (length: number) => {
  let result = '';
  const generator = murmurhash3_x64_128(`${generateUUID}`);
  const characters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789${generator}`;
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateNumber = (length: number) => {
  let result = '';

  const generator = murmurhash2_x86_32(`${generateUUID}`);
  const characters = `0123456789${generator}`;
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const isNotUndefined = (input: string): boolean =>
  String(input) !== String(undefined) && input.trim() !== '';

export const Slug = (input: string): string =>
  slugify(input, {
    replacement: '-', // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: false, // strip special characters except replacement, defaults to `false`
    locale: 'vi', // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });
