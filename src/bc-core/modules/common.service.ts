import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Msg, MsgSend, Tx, Wallet, SignMode } from '@xpla/xpla.js';
import { Coinbalance } from './modules.inerface';
import {
  BlockchainException,
  BlockchainStatus,
} from '../../exception/blockchain.exception';

@Injectable()
export class CommonService {
  private bc = this.blockchainService.blockChainClient();
  private lcd = this.blockchainService.lcdClient();

  constructor(private readonly blockchainService: BlockchainService) {}

  public async makeTx(signer: { address: string }[], msgs: Msg[]): Promise<Tx> {
    try {
      return await this.lcd.tx.create(signer, {
        msgs: msgs,
      });
    } catch (err) {
      throw new BlockchainException(
        err.response.message,
        err.response?.data,
        BlockchainStatus.CREATE_TX_ERROR,
      );
    }
  }

  public async sign(wallet: Wallet, tx: Tx, sequence?: number): Promise<Tx> {
    const walletInfo = await wallet.accountNumberAndSequence();

    try {
      const sign = await wallet.key.signTx(tx, {
        chainID: this.lcd.config.chainID,
        signMode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
        sequence: sequence ? sequence : walletInfo.sequence,
        accountNumber: walletInfo.account_number,
      });
      return sign;
    } catch (err) {
      throw new BlockchainException(
        err.response.message,
        err.response?.data,
        BlockchainStatus.SIGN_ERROR,
      );
    }
  }

  public async getBalance(address: string): Promise<Coinbalance[]> {
    return await this.bc.client.getBalance(address);
  }

  public async transferCoin(
    sender: string,
    receiver: string,
    amount: string,
    denom: string,
  ): Promise<MsgSend> {
    try {
      return new MsgSend(sender, receiver, amount + denom);
    } catch (err) {
      throw new BlockchainException(
        err.response.message,
        err.response?.data,
        BlockchainStatus.TRANSFER_COIN_ERROR,
      );
    }
  }

  // TODO. game-api 서버에서 broadcast 기능 없애야함
  // Queue에 넣고 consumer에서 처리
  public async broadcast(signedTx: Tx): Promise<any> {
    try {
      return await this.lcd.tx.broadcastSync(signedTx);
    } catch (err) {
      throw new BlockchainException(
        err.response.message,
        err.response?.data,
        BlockchainStatus.BROADCAST_ERROR,
      );
    }
  }
}
