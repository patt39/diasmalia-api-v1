import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { S3 } from 'aws-sdk';
import axios from 'axios';
import { config } from '../../../app/config';

export const awsS3ServiceAdapter = async (data: {
  file: PutObjectCommandInput['Body'];
  fileName: string;
  mimeType: string;
  folder: string;
}): Promise<any> => {
  const { file, fileName, mimeType, folder } = data;

  const awsClient = new S3({
    region: config.implementations.aws.region,
    accessKeyId: config.implementations.aws.accessKeyId,
    secretAccessKey: config.implementations.aws.secretKey,
  });

  const params = {
    Bucket: `${config.implementations.aws.bucket}/${folder}`,
    Key: fileName,
    Body: file,
    ACL: 'public-read',
    ContentType: mimeType,
    ContentDisposition: 'inline',
    CreateBucketConfiguration: {
      LocationConstraint: config.implementations.aws.region,
    },
  };

  const responseAws = file ? await awsClient.upload(params).promise() : '';
  const response = { ...responseAws };
  return response;
};

export const getFileToAws = async (options: {
  folder: string;
  fileName: string;
}): Promise<{ fileBuffer: Buffer; contentType: string; imageUrl: string }> => {
  const { folder, fileName } = options;
  const imageUrl = `https://${config.implementations.aws.bucket}.s3.${config.implementations.aws.region}.amazonaws.com/${folder}/${fileName}`;
  const imageResponse = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
  });
  const fileBuffer = Buffer.from(imageResponse.data, 'binary');
  const contentType = imageResponse.headers['content-type'];

  return { fileBuffer, contentType, imageUrl };
};
