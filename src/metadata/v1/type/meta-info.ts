import { ExtensionDto } from '../dto/metadata-v1.dto';

export interface Metadata {
  id: string;
  url: string;
  extension?: ExtensionDto;
}
