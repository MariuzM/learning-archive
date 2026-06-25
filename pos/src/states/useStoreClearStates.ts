import create from 'zustand';

import { useStoreGlobalData } from './useStoreGlobalData';

type T = {
  clearStatesAndData: () => void;
};

export const useStoreClearStates = create<T>((set, get): T => {
  return {
    clearStatesAndData: () => {
      useStoreGlobalData.getState().clearStoreGlobalData();
    },
  };
});
