import { Test, TestingModule } from '@nestjs/testing';
import { LCDClient, MnemonicKey, MsgSend, Wallet } from '@terra-money/terra.js';
import { BlockchainClient } from '@blockchain/chain-bridge';
import { BlockchainService } from '../blockchain/blockchain.service';
import { coreProviders } from '../core.provider';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { CommonService } from './common.service';

describe('CommonService', () => {
  const sender = {
    address: 'terra14vqqls4t0np2g92lh0h92934ntwk0gaxqhn7wc',
    mnemonic:
      'salute actor hen river distance bus scissors bike blush return purity laugh remind rough magic work drum able car embrace rather credit blue add',
  };

  const receiver = {
    address: 'terra1dpau8af8qu3cpturacqu26uwnn2wagfqgu3c4p',
    mnemonic:
      'course patient raw vapor evoke survey together math decorate mango use fence abuse column coach tree fine wedding mixture educate acquire inject script milk',
  };

  let walletService: BlockchainService;
  let commonService: CommonService;
  let lcd: LCDClient;
  let bc: BlockchainClient;

  beforeEach(async () => {
    process.env.BC_TYPE = 'terra';
    process.env.BC_NODE_URL = 'http://34.146.148.127:1317';
    process.env.BC_CHAIN_ID = 'localterra';

    const app: TestingModule = await Test.createTestingModule({
      imports: [BlockchainModule],
      controllers: [],
      providers: [...coreProviders, BlockchainService, CommonService],
      exports: [],
    }).compile();

    walletService = app.get<BlockchainService>(BlockchainService);
    commonService = app.get<CommonService>(CommonService);
    lcd = walletService.lcdClient();
    bc = walletService.blockChainClient();
  });

  //lock
  describe('common', () => {
    it('get Balance coin', async () => {

      const balance = await commonService.getBalance(
        'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v',
      );

      expect(balance).not.toBeNull();
      console.log('balance', balance);
    });

    it('transfer coin', async () => {
      const msg = await commonService.transferCoin(
        sender.address,
        receiver.address,
        '1000000',
        'uluna',
      );

      const createTx = await lcd.tx.create([], {
        msgs: [msg],
      });
      //
      const wallet: Wallet = lcd.wallet(
        new MnemonicKey({ mnemonic: sender.mnemonic }),
      );
      const signedTx = await commonService.sign(wallet, createTx);
      const hash = await lcd.tx.broadcast(signedTx);
      expect(hash).not.toBeNull();
      console.log(hash);
    });
  });
});
