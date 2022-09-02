import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class V1GameApiBroadcastInputDto {
  @ApiProperty({
    example: '84acbf74-cc98-4fce-963d-4402e9ded9dd',
    description: 'request Id',
  })
  @IsString()
  requestId: string;

  @ApiProperty({
    example:
      'CvkBCvYBCiQvY29zbXdhc20ud2FzbS52MS5Nc2dFeGVjdXRlQ29udHJhY3QSzQEKK3hwbGExNnY2eTQ4eGxsd3k3YW1jbXZoa3YwYTN6cDdqZXBsNDR5dmh2eHQSP3hwbGExcGc0ZHhlZDYwcTN3NWE2ZHk4Y2E4NHE3d2E3ZDlxbTBhbXh3NWo3em13Y3B2Z2VmZzZ4c2h2ZG1oNhpdeyJ0cmFuc2ZlciI6eyJyZWNpcGllbnQiOiJ4cGxhMW5sbmFuZzNhOHd3Z3d4MHNtNHp1dDl5Z3g4bXJ2ZGVzNW45bTNnIiwiYW1vdW50IjoiMTUwMDAwMDAwIn19EiMSIQobCgVheHBsYRISMjA5NTAzOTYyNTAwMDAwMDAwEMuFDw==',
    description: 'encoded signed Tx',
  })
  @IsString()
  signedTx: string;
}

export class V1GameApiBroadcastOutputDto {
  @ApiProperty({
    example: '779E8A0C433292EE1F15CC6587D43EE05D73DA8ACF14AC12F16EA0CE923F5130',
    description: 'Tx Hash',
  })
  @IsString()
  txHash: string;
}
