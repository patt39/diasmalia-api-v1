import { Injectable } from '@nestjs/common';
import * as mime from 'mime-types';
import { formateNowDateYYMMDD } from '../../app/utils/commons/formate-date';
import {
  Slug,
  generateLongUUID,
} from '../../app/utils/commons/generate-random';
import { awsS3ServiceAdapter } from '../integrations/aws/aws-s3-service-adapter';

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
      const nameFile = `${Slug(file?.originalname)}${formateNowDateYYMMDD(
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
