//transaction.dao
export enum BlockchainError {
  SUCCESS = 0,
  INVALID_TXHASH = 3,
  WRONG_NUMBER_SIGNER = 4,
  OUT_OF_GAS = 11,
  SEQUCNCE_MISMATCH = 32,
}
