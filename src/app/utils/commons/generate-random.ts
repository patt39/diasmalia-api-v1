import { murmurhash2_x86_32 } from 'number-generator';
import { murmurhash3_x64_128 } from 'number-generator';
import { v4 as uuidv4 } from 'uuid';

export const generateUUID = () => {
  return uuidv4();
};

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
