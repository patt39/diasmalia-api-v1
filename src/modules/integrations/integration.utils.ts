import { Injectable } from '@nestjs/common';
import * as mime from 'mime-types';
import {
  formatNowDateYYMMDD,
  generateLongUUID,
  Slug,
} from 'src/app/utils/commons';
import { awsS3ServiceAdapter } from './aws/aws-s3-service-adapter';

type ExpressFile = Express.Multer.File;
@Injectable()
export class UploadsUtil {
  constructor() {}

  async uploadOneAWS(options: {
    file: ExpressFile;
    folder: string;
    userId: string;
  }) {
    const { file, folder, userId } = options;
    let urlAWS: any = {};
    let fileName = '';
    if (file) {
      const extension = mime.extension(file.mimetype);
      const nameFile = `${Slug(file?.originalname)}${formatNowDateYYMMDD(
        new Date(),
      )}-${generateLongUUID(4)}`;
      fileName = `${`${nameFile}.${extension}`}`;
      urlAWS = await awsS3ServiceAdapter({
        fileName: fileName,
        mimeType: file?.mimetype,
        folder: folder,
        file: file.buffer,
      });
    }

    return { fileName, urlAWS, userId };
  }
}
