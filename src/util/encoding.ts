import { Tx } from '@xpla/xpla.js';
import { Tx as Tx_pb } from '@terra-money/terra.proto/cosmos/tx/v1beta1/tx';

export const txEncoding = (unSignedTx: Tx) => {
  return Buffer.from(unSignedTx.toBytes()).toString('base64');
};

export const txDecoding = (encodedTx: string) => {
  return Tx.fromProto(Tx_pb.decode(Buffer.from(encodedTx, 'base64')));
};
