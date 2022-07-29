import { BlockchainClient } from '@blockchain/chain-bridge';

export const gameApiProviders = [
    {
        provide: 'BLOCKCHAIN_CLIENT',
        useFactory: (blockchainClient: BlockchainClient) => blockchainClient,
        inject: ['CHAIN_SOURCE'],
    },
];
