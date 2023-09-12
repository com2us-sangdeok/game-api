import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 공용 코드 정보 테이블
 */
@Entity('tb_code')
@Index('code_idx_01', ['code', 'state'])
export class CodeEntity {
  @PrimaryColumn({
    name: 'cd_code',
    type: 'char',
    length: 12,
    comment: '코드(코드그룹4자리 + 코드그룹레벨2자리 + 코드순번4자리)',
  })
  code: string;

  @Column({ name: 'cd_name', type: 'varchar', length: 50, comment: '코드명' })
  name: string;

  @Column({
    name: 'cd_desc',
    type: 'varchar',
    length: 255,
    comment: '코드설명',
  })
  description: string;

  @Column({
    name: 'cd_state',
    type: 'tinyint',
    default: 0,
    comment: '상태(0:미사용,1:사용, 2:테스트)',
  })
  state: number;

  @Column({
    name: 'cd_reg_id',
    type: 'varchar',
    length: 20,
    comment: '등록자ID',
  })
  createAdmin: string;

  @CreateDateColumn({
    name: 'cd_reg_date',
    type: 'datetime',
    comment: '등록일시',
  })
  createAt: string;

  @Column({
    name: 'cd_mod_id',
    type: 'varchar',
    length: 20,
    comment: '수정자ID',
  })
  updateAdmin: string;

  @UpdateDateColumn({
    name: 'cd_mod_date',
    type: 'datetime',
    comment: '수정일시',
  })
  updateAt: string;
}

/**
 * 공용 코드 그룹 테이블
 */
@Entity('tb_code_group')
@Index('code_group_idx_01', ['groupCode', 'state'])
@Index('code_group_idx_02', ['level'])
export class CodeGroupEntity {
  @PrimaryColumn({
    name: 'cg_group_code',
    type: 'varchar',
    length: 255,
    comment: '코드그룹코드',
  })
  groupCode: string;

  @Column({
    name: 'cg_parent_grp_cd',
    type: 'char',
    length: 12,
    comment: '상위코드그룹코드',
  })
  parentGrpCd: string;

  @Column({
    name: 'cg_name',
    type: 'varchar',
    length: 50,
    comment: '코드그룹명',
  })
  name: string;

  @Column({
    name: 'cg_desc',
    type: 'varchar',
    length: 255,
    comment: '코드그룹설명',
  })
  description: string;

  @Column({
    name: 'cg_level',
    type: 'tinyint',
    default: 0,
    comment: '그룹차수',
  })
  level: number;

  @Column({
    name: 'cg_state',
    type: 'tinyint',
    default: 0,
    comment: '상태(0:미사용,1:사용, 2:테스트)',
  })
  state: number;

  @Column({
    name: 'cg_reg_id',
    type: 'varchar',
    length: 20,
    comment: '등록자ID',
  })
  createAdmin: string;

  @CreateDateColumn({
    name: 'cg_reg_date',
    type: 'datetime',
    comment: '등록일시',
  })
  createAt: string;

  @Column({
    name: 'cg_mod_id',
    type: 'varchar',
    length: 20,
    comment: '수정자ID',
  })
  updateAdmin: string;

  @UpdateDateColumn({
    name: 'cg_mod_date',
    type: 'datetime',
    default: null,
    comment: '수정일시',
  })
  updateAt: string;
}

/**
 * 공용 코드와 코드 그룹을 그룹핑 하는 테이블
 */
@Entity('tb_code_group_code')
@Index('code_group_code_idx_01', ['groupCode', 'order'])
@Index('code_group_code_idx_02', ['code'])
export class CodeGroupCodeEntity {
  @PrimaryColumn({ name: 'cd_code', type: 'char', length: 12, comment: '코드' })
  code: string;

  @Column({
    name: 'group_code',
    type: 'varchar',
    length: 255,
    comment: '코드그룹코드',
  })
  groupCode: string;

  @Column({
    name: 'cgc_order',
    type: 'char',
    length: 12,
    comment: '코드정렬순서(내림차순우선)',
  })
  order: number;

  @Column({
    name: 'cgc_state',
    type: 'tinyint',
    default: 0,
    comment: '상태(0:미사용,1:사용, 2:테스트)',
  })
  state: number;
}

/**
 * 회사정보 테이블
 * TODO: 하이브 콘솔 > 앱센터 > 콜백 URL 관리 > 데이터 전송 이력 연동 후 스키마 재 정의가 필요함. (담당자: 이준호 책임)
 */
@Entity('tb_company')
@Index('company_idx_01', ['company'])
export class CompanyEntity {
  @PrimaryColumn({
    name: 'company',
    type: 'int',
    comment: '회사 정보, 하이브에서는 middleid 컬럼명으로 사용됨',
  })
  company: number;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 50,
    comment: 'String으로 구성된 코드, Hive 에서는 컬럼명으로 사용됨',
  })
  code: string;
}

/**
 * 언어별 회사 이름 정보 테이블
 * TODO: 하이브 콘솔 > 앱센터 > 콜백 URL 관리 > 데이터 전송 이력 연동 후 스키마 재 정의가 필요함. (담당자: 이준호 책임)
 */
@Entity('tb_company_name')
@Index('company_name_idx_01', ['company'])
export class CompanyNameEntity {
  @PrimaryColumn({
    name: 'company',
    type: 'int',
    comment: 'tb_company 테이블의 의 고유번호',
  })
  company: number;

  @Column({
    name: 'language',
    type: 'varchar',
    length: 10,
    comment: '언어 코드(ISO 639-1)',
  })
  language: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    comment: '언어별 회사 명',
  })
  name: string;
}

/**
 * 게임 정보 테이블
 * TODO: 하이브 콘솔 > 앱센터 > 콜백 URL 관리 > 데이터 전송 이력 연동 후 스키마 재 정의가 필요함. (담당자: 이준호 책임)
 */
@Entity('tb_game_info')
@Index('game_info_idx_01', ['gameindex', 'company'])
export class GameInfoEntity {
  @PrimaryColumn({
    name: 'gameindex',
    type: 'int',
    comment: 'Hive 게임 고유번호',
  })
  gameindex: number;

  @Column({
    name: 'company',
    type: 'int',
    unsigned: true,
    comment: 'tb_company 테이블의 고유 번호 (회사 고유 번호)',
  })
  company: number;

  @Column({
    name: 'gameid',
    type: 'varchar',
    length: 128,
    comment: '게임 아이디 정보',
  })
  gameId: string;

  @Column({
    name: 'icon_image',
    type: 'varchar',
    length: 45,
    comment: '게임 아이콘 이미지 URI',
  })
  iconImage: string;
}

/**
 * 언어별 게임 명 테이블
 */
@Entity('tb_game_name')
@Index('game_name_idx_01', ['gameindex', 'language'])
export class GameNameEntity {
  @PrimaryColumn({
    name: 'gameindex',
    type: 'int',
    comment: 'tb_game 의 gameindex',
  })
  gameindex: number;

  @Column({
    name: 'language',
    type: 'varchar',
    length: 10,
    comment: '언어 코드(ISO 639-1)',
  })
  language: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    comment: '언어별 게임명',
  })
  name: string;
}

/**
 * 앱정보 테이블
 * TODO: 하이브 콘솔 > 앱센터 > 콜백 URL 관리 > 데이터 전송 이력 연동 후 스키마 재 정의가 필요함. (담당자: 이준호 책임)
 */
@Entity('tb_app_info')
@Index('app_info_idx_01', ['appindex'])
@Index('app_info_idx_02', ['appid'])
export class AppInfoEntity {
  @PrimaryColumn({ name: 'appindex', type: 'int', comment: '앱 고유번호' })
  appindex: number;

  @Column({
    name: 'gameindex',
    type: 'int',
    comment: 'tb_game_info 의 gameindex',
  })
  gameindex: number;

  @Column({
    name: 'appid',
    type: 'varchar',
    length: 255,
    comment: '앱 고유 ID',
  })
  appid: string;
}
