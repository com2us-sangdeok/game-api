import { Test, TestingModule } from '@nestjs/testing';
import { LCDClient, MnemonicKey, Wallet } from '@xpla/xpla.js';
import { BlockchainClient } from '@blockchain/chain-bridge';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { coreProviders } from '../../core.provider';
import { BlockchainModule } from '../../blockchain/blockchain.module';
import { CW20Service } from './cw20.service';
import { CommonService } from '../common.service';

describe('cw20 token', () => {
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
  let cw20Service: CW20Service;
  let lcd: LCDClient;
  let bc: BlockchainClient;
  beforeEach(async () => {
    process.env.BC_TYPE = 'xpla';
    process.env.BC_NODE_URL = 'https://cube-lcd.xpla.dev';
    process.env.BC_CHAIN_ID = 'cube_47-4';

    const app: TestingModule = await Test.createTestingModule({
      imports: [BlockchainModule],
      controllers: [],
      providers: [
        ...coreProviders,
        BlockchainService,
        CommonService,
        CW20Service,
      ],
      exports: [],
    }).compile();

    walletService = app.get<BlockchainService>(BlockchainService);
    commonService = app.get<CommonService>(CommonService);
    cw20Service = app.get<CW20Service>(CW20Service);
    lcd = walletService.lcdClient();
    bc = walletService.blockChainClient();
  });

  const cw20Contract =
    'xpla1pg4dxed60q3w5a6dy8ca84q7wa7d9qm0amxw5j7zmwcpvgefg6xshvdmh6';

  describe('cw20 contract', () => {
    it('get token balance', async () => {
      const balance = await cw20Service.tokenBalance(
        cw20Contract,
        sender.address,
      );

      expect(balance).not.toBeNull();
      console.log('balance', balance);
    });

    it('transfer token', async () => {
      const amount = '1000000';
      const msg = await cw20Service.transferToken(
        cw20Contract,
        sender.address,
        receiver.address,
        amount,
      );

      expect(msg).not.toBeNull();
      console.log('balance', msg);

      const createTx = await lcd.tx.create([{ address: sender.address }], {
        msgs: [msg],
      });

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
