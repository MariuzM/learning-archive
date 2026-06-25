import { type BigNumber } from 'ethers';

export type TypeWeb3 = {
  account?: {
    address: `0x${string}` | undefined;
    isConnected?: boolean | undefined;
  };
  balance?: {
    symbol?: string | undefined;
  };

  // address?: `0x${string}` | undefined;
  // blockNumber?: number | undefined;
  // network?: string | undefined;
};
