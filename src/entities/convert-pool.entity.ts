import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('ConvertPool')
export class ConvertPoolEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'afkraid', description: 'game' })
  @Column({ type: 'varchar' })
  appName: string;

  @ApiProperty({ example: 100, description: 'lower game currency' })
  @Column({ type: 'numeric', default: 0 })
  lowerGameCurrency: number;

  @ApiProperty({ example: 0, description: 'game token' })
  @Column({ type: 'numeric', default: 0 })
  gameToken: number;

  @ApiProperty({ example: 100, description: 'upper game currency' })
  @Column({ type: 'numeric', default: 0 })
  upperGameCurrency: number;

  @ApiProperty({ example: 0, description: 'c2x' })
  @Column({ type: 'numeric', default: 0 })
  ctx: number;

  @ApiProperty({ example: '2022-07-06T19:04:04.739Z' })
  @CreateDateColumn()
  createdAt: string;

  @ApiProperty({ example: '2022-07-06T19:04:04.739Z' })
  @UpdateDateColumn()
  updatedAt: string;
}
