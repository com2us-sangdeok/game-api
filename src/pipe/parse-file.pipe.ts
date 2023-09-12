import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import {GameApiException, GameApiHttpStatus} from "../exception/exception";

@Injectable()
export class ParseFile implements PipeTransform {
  transform(
    files: Express.Multer.File | Express.Multer.File[],
    metadata: ArgumentMetadata,
  ): Express.Multer.File | Express.Multer.File[] {
    if (files === undefined || files === null) {
      throw new GameApiException(
        'Validation failed (file expected)',
        '',
        GameApiHttpStatus.BAD_REQUEST,
      );
    }

    if (Array.isArray(files) && files.length === 0) {
      throw new GameApiException(
        'Validation failed (file expected)',
        '',
        GameApiHttpStatus.BAD_REQUEST,
      );
    }

    return files;
  }
}
