import { Test, TestingModule } from '@nestjs/testing';
import { LCDClient, MnemonicKey, MsgSend, Wallet } from '@xpla/xpla.js';
import { BlockchainClient } from '@blockchain/chain-bridge';
import { BlockchainService } from '../blockchain/blockchain.service';
import { coreProviders } from '../core.provider';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { CommonService } from './common.service';

describe('CommonService', () => {
  const sender = {
    address: 'xpla16v6y48xllwy7amcmvhkv0a3zp7jepl44yvhvxt',
    mnemonic:
      'predict junior nation volcano boat melt glance climb target rubber lyrics rain fall globe face catch plastic receive antique picnic domain head hat glue',
  };

  const receiver = {
    address: 'xpla1xvh9tt6gsrn0yem2fv6xjfrfyefal42ezzxhca',
    mnemonic:
      'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius',
  };

  let walletService: BlockchainService;
  let commonService: CommonService;
  let lcd: LCDClient;
  let bc: BlockchainClient;

  beforeEach(async () => {
    process.env.BC_TYPE = 'xpla';
    process.env.BC_NODE_URL = 'https://cube-lcd.xpla.dev';
    process.env.BC_CHAIN_ID = 'cube_47-4';

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

  describe('common', () => {
    it('get Balance coin', async () => {

      const balance = await commonService.getBalance(sender.address);
      const balance2 = await commonService.getBalance(receiver.address);

      expect(balance).not.toBeNull();
      console.log('balance', balance);
      console.log('balance2', balance2);
    });

    it('transfer coin', async () => {
      const msg = await commonService.transferCoin(
        sender.address,
        receiver.address,
        '100000000',
        'uusd',
      );

      const createTx = await lcd.tx.create([{ address: sender.address }], {
        msgs: [msg],
      });
      //
      const wallet: Wallet = lcd.wallet(
        new MnemonicKey({ mnemonic: sender.mnemonic }),
      );
      const signedTx = await commonService.sign(wallet, createTx);
      // const hash = await commonService.broadCast(signedTx);
      const hash = await lcd.tx.broadcastSync(signedTx);
      expect(hash).not.toBeNull();

      console.log(hash);
    });
  });
});
