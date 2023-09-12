import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DeleteYN } from '../enum/delete-yn.enum';

@Entity('tb_wallet_info')
export class WalletInfoEntity {
  constructor(options?: Partial<WalletInfoEntity>) {
    Object.assign(this, options);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '1',
    description: 'company id',
  })
  @Column({ type: 'int' })
  company: number;

  @ApiProperty({
    example: 'com.com2us.hivesdk.c2xwallet.hivepc.kr.test',
    description: 'game app id',
  })
  @Column({ type: 'varchar' })
  address: string;

  @ApiProperty({
    example: 'com.com2us.hivesdk.c2xwallet.hivepc.kr.test',
    description: 'game app id',
  })
  @Column({ name: 'wallet_type', type: 'varchar' })
  walletType: string;

  @ApiProperty({
    example: '',
    description: 'game app id',
  })
  @Column({ name: 'provider_address', type: 'varchar' })
  providerAddress: string;

  @ApiProperty({
    example: 'y | n',
    description: '삭제 여부',
  })
  @Column({ name: 'del_yn', type: 'varchar' })
  deleteYN: DeleteYN;
}
