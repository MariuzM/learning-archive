import create from 'zustand';

import { type TypeLanguages } from '../types/general.type';

type T = {
  lang: TypeLanguages | undefined;

  langSet: (d: TypeLanguages) => void;
};

export const useStoreUserData = create<T>((set, get): T => {
  return {
    lang: undefined,

    langSet: (d: TypeLanguages) => set({ lang: d }),
  };
});
