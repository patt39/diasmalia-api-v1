export interface KeyAsString {
  [key: string]: string;
}

export const mineTypeFile: KeyAsString = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'https://berivo.s3.eu-central-1.amazonaws.com/svg/files/doc.svg',
  'application/pdf':
    'https://berivo.s3.eu-central-1.amazonaws.com/svg/files/pdf.svg',
  'text/csv': 'https://berivo.s3.eu-central-1.amazonaws.com/svg/files/xml.svg',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    'https://berivo.s3.eu-central-1.amazonaws.com/svg/files/xml.svg',
  'image/jpeg':
    'https://berivo.s3.eu-central-1.amazonaws.com/svg/files/blank-image.svg',
  'image/apng':
    'https://berivo.s3.eu-central-1.amazonaws.com/svg/files/blank-image.svg',
  'image/avif':
    'https://berivo.s3.eu-central-1.amazonaws.com/svg/files/blank-image.svg',
  'image/gif':
    'https://berivo.s3.eu-central-1.amazonaws.com/svg/files/blank-image.svg',
  'image/png':
    'https://berivo.s3.eu-central-1.amazonaws.com/svg/files/blank-image.svg',
  'image/svg':
    'https://berivo.s3.eu-central-1.amazonaws.com/svg/files/blank-image.svg',
};
