// todo: DB > Caching > Searching?

export enum GameServerApiCode {
  SERVERS = '1001000501', // 서버 목록 조회
  MINT_CHARACTER_LIST = '1001000502', // 캐릭터 목록 조회
  CONVERT_GOODS_LIST = '1001000503', // 보유 재화 정보 조회
  MINT_ITEM_LIST = '1001000504', // 카테고리 아이템 정보 조회
  CONFIRM_CONVERTING = '1001000505', // Convert 가능 여부 조회
  CONFIRM_MINTING = '1001000506', // 아이템 Minting 가능 여부 조회
  MINT = '1001000507', // 보유 아이템 업데이트
  CONVERT = '1001000508', // 보유 재화 업데이트
  LOCK_ITEM_NFT = '1001000509', // 보유 아이템 Lock
  UNLOCK_ITEM_NFT = '1001000510', // 보유 아이템 Unlock
  LOCK_CHARACTER_NFT = '1001000511', // 보유 케릭터 Lock
  UNLOCK_CHARACTER_NFT = '1001000512', // 보유 케릭터 unLock
  TX_RESULT = '1001000513', // 결과 알림
}

export enum GameCategory {
  ACTIVE = '1001000601',
  INACTIVE = '1001000602',
  MINT_ITEM = '1001000701',
  MINT_ITEMS = '1001000702',
  MINT_CHARACTER = '1001000703',
}
