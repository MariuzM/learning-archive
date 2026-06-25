import create from 'zustand';

type T = {
  user: string;
  userSet: (v: string) => void;

  clearStoreGlobalData: () => void;
};

export const useStoreGlobalData = create<T>((set, get): T => {
  return {
    user: '',
    userSet: (v) => set({ user: v }),

    clearStoreGlobalData: () => {
      set({
        user: '',
      });
    },
  };
});
