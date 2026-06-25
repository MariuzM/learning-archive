import { create } from 'zustand';

import { API_GET_Init } from '../apis/init.api';
import type { Init } from '../types/init.type';

type T = {
  lastInitTime: number;

  data: Init[];
  initData: () => Promise<void>;
};

export const useStateInit = create<T>((set, get): T => {
  return {
    lastInitTime: 0,

    data: [],
    initData: async () => {
      if (Date.now() - get().lastInitTime < 5 * 60 * 1000) return;

      const res = await API_GET_Init();

      if (res) {
        set({
          lastInitTime: Date.now(),
          data: res,
        });
      }
    },
  };
});
