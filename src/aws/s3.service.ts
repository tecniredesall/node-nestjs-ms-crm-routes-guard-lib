import { Injectable } from '@nestjs/common';
import configuration from '@app/config/configuration';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3 = new S3({
    accessKeyId: configuration.aws_s3.accessKeyId,
    secretAccessKey: configuration.aws_s3.secretAccessKey,
  });

  async upload(file: Express.Multer.File) {
    const params: S3.PutObjectRequest = {
      Bucket: configuration.aws_s3.bucket,
      Key: file.originalname,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };

    const data = await this.s3.upload(params).promise();
    return data.Location;
  }

  async remove(fileName: string) {
    const params: S3.DeleteObjectRequest = {
      Bucket: configuration.aws_s3.bucket,
      Key: fileName,
    };

    const result = await this.s3.deleteObject(params).promise();
    return result;
  }
}
