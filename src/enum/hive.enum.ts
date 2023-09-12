export const MaintenanceResCodeMessage = {
  0: '성공',
  4000: '유효하지 않은 파라미터',
  4001: 'request json 에러',
  4002: 'hive 인증키 검증 실패',
  4100: '암호화 header 에 TIMESTAMP 없음',
  4101: '암호화 Body Hash 불일치',
  4102: '암호화 에러',
  4103: '복호화 에러',
  5000: 'DB 에러',
  6000: '유효하지 않는 appid',
  6001: 'Platform ID 가 존재하지 않음',
  7000: 'MQ 에러',
  7001: 'MQ connection 에러',
  7002: 'MQ send 에러',
  7100: 'Curl 호출 에러',
  7101: 'Curl 호출 에러',
  9000: 'API Call Error',
  9001: '서버에러',
  9999: '알수없는 오류',
};

export enum MaintenanceCode {
  SUCCESS = 0,
}
