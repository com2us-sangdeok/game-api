import { Test, TestingModule } from '@nestjs/testing';
import {
  Fee,
  LCDClient,
  MnemonicKey,
  MsgSend,
  Wallet,
  Coins,
} from '@xpla/xpla.js';
import { BlockchainClient } from '@blockchain/chain-bridge';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { coreProviders } from '../../core.provider';
import { BlockchainModule } from '../../blockchain/blockchain.module';
import { CommonService } from '../common.service';
import { CW721Service } from './cw721.service';

describe('cw721Service', () => {
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
  //TODO 아직 테스트 안함
  const nftContract = 'terra1sshdl5qajv0q0k6shlk8m9sd4lplpn6gggfr86';

  const randNum = Math.floor(Math.random() * 100000);

  let walletService: BlockchainService;
  let commonService: CommonService;
  let cw721Service: CW721Service;

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
        CW721Service,
      ],
      exports: [],
    }).compile();

    walletService = app.get<BlockchainService>(BlockchainService);
    commonService = app.get<CommonService>(CommonService);
    cw721Service = app.get<CW721Service>(CW721Service);

    lcd = walletService.lcdClient();
    bc = walletService.blockChainClient();
  });

  describe('cw721 nft conftact test', () => {
    it('mint', async () => {
      jest.setTimeout(10000);
      const attributes = [
        {
          trait_type: 'name',
          value: 'minho',
        },
      ];

      try {
        const mintMsg = await cw721Service.mint(
          sender.address,
          nftContract,
          receiver.address,
          randNum.toString(),
          `${randNum}_test_uri1`,
          {
            image: 'Asdasd',
            attributes: attributes,
          },
        );

        const unsignedTx = await lcd.tx.create([{ address: sender.address }], {
          msgs: [mintMsg],
        });

        const ownerWallet = bc.client.wallet(sender.mnemonic);
        const signedTx = await commonService.sign(ownerWallet, unsignedTx);
        const hash = await lcd.tx.broadcast(signedTx);
        expect(hash).not.toBeNull();
        console.log('mint', hash);
      } catch (err) {
        console.log(err);
      }
    });

    it('nft Detail', async () => {
      const nftDetail = await cw721Service.nftDetail(
        nftContract,
        // randNum.toString(),
        '1',
      );
      expect(nftDetail).not.toBeNull();
      console.log('nft Detail', nftDetail);
    });

    it('nft List', async () => {
      const nftList = await cw721Service.nftList(nftContract, sender.address);
      expect(nftList).not.toBeNull();
      console.log('nft List', nftList);
    });

    // address -> address
    it('tranfer nft', async () => {
      const transferMsg = await cw721Service.transferToken(
        nftContract,
        sender.address,
        receiver.address,
        '123',
      );

      const unSignedTx = await lcd.tx.create([{ address: sender.address }], {
        msgs: [transferMsg],
      });

      const senderWallet = bc.client.wallet(sender.mnemonic);

      const signedTx = await commonService.sign(senderWallet, unSignedTx);
      const hash = await lcd.tx.broadcast(signedTx);
      expect(hash).not.toBeNull();
      console.log('signedTx', hash);
    });
  });
});
