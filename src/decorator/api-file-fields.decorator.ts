import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  MulterField,
  MulterOptions,
} from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ApiFile } from './api-file.decorator';
import { fileMimetypeFilter } from '../filter/file-mimetype.filter';

export type UploadFields = MulterField & { required?: boolean };

export function ApiFileFields(
  uploadFields: UploadFields[],
  localOptions?: MulterOptions,
) {
  const bodyProperties: Record<string, SchemaObject | ReferenceObject> =
    Object.assign(
      {},
      ...uploadFields.map((field) => {
        return { [field.name]: { type: 'string', format: 'binary' } };
      }),
    );
  const apiBody = ApiBody({
    schema: {
      type: 'object',
      properties: bodyProperties,
      required: uploadFields.filter((f) => f.required).map((f) => f.name),
    },
  });

  return applyDecorators(
    UseInterceptors(FileFieldsInterceptor(uploadFields, localOptions)),
    ApiConsumes('multipart/form-data'),
    apiBody,
  );
}

export function ApiImageFile(
  fileName: string = 'image',
  required: boolean = false,
) {
  return ApiFile(fileName, required, {
    fileFilter: fileMimetypeFilter('image'),
  });
}

export function ApiPdfFile(
  fileName: string = 'document',
  required: boolean = false,
) {
  return ApiFile(fileName, required, {
    fileFilter: fileMimetypeFilter('pdf'),
  });
}