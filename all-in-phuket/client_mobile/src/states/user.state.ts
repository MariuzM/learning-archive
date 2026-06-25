import { create } from 'zustand';

import type { User } from '../types/user.type';
import { delAccessToken, delRefreshToken } from '../utils/token.util';

type T = {
  user: User | null;
  setUser: (user: User | null) => void;

  token: string;
  setToken: (token: string) => void;

  logout: () => void;
};

export const useStateUser = create<T>((set, get): T => {
  return {
    user: null,
    setUser: (user) => set({ user }),

    token: '',
    setToken: (token) => set({ token }),

    logout: async () => {
      await delAccessToken();
      await delRefreshToken();
      set({ user: null });
      set({ token: '' });
    },
  };
});
