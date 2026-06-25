import create from 'zustand';

import { type TypeWeb3 } from '../types/storeWeb3.type';

type T = {
  web3: TypeWeb3;

  web3Update: (d: TypeWeb3) => void;
};

export const useStoreWeb3 = create<T>((set, get): T => {
  return {
    web3: {} as TypeWeb3,

    web3Update: (d: TypeWeb3) => {
      set((s) => {
        return { web3: { ...s.web3, ...d } };
      });
    },
  };
});
