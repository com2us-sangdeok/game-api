export enum TxStatus {
  //unsignedTx 상태(txBody 비교를 위해 db에 저장됨)
  WAIT,
  //broadcast후 txHash 업데이트시 상태 같이 업데이트
  PENDING,
  //블록체인상 성공
  SUCCESS,
  //블록체인 상 실패
  FAIL,
  //펜딩중일때 결과가 Invalid txHash 상태로 나옴, 계속 체크를 하기 위한 상태
  PENDINGINVALID,
  // broadcast시 실패 할 경우(블록 반영x)
  REJECT = 99,
}
