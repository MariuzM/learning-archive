import create from 'zustand';

import { API_GET_Product } from '../services/api-rest/product';
import type { TypeProduct } from '../types/typesServerDataTypes';

type TypeModal = {
  isOpen: boolean;
  data?: {
    title: string;
    description: string;
    component?: React.ReactNode;
    actionButtons?: {
      id: string;
      label: string;
      type: 'primary' | 'secondary';
      onClick: () => void;
    }[];
  };
};

type T = {
  isModal: TypeModal;
  isModalSet: ({ isOpen, data }: TypeModal) => void;

  isSavedReceipt: boolean;

  itemSelected: TypeProduct | null;
  itemSelectedChanged: null;

  receiptItemSelected: ({
    _receiptItemId,
    id,
    quantity,
  }: {
    _receiptItemId: number;
    id: number;
    quantity: number;
  }) => void;

  clearStoreGlobalData: () => void;
};

export const useStoreUI = create<T>((set, get): T => {
  return {
    isModal: { isOpen: false },
    isModalSet: (v) => set({ isModal: v }),

    isSavedReceipt: false,

    itemSelected: null,
    itemSelectedChanged: null,

    receiptItemSelected: async ({ _receiptItemId, id, quantity }) => {
      const isData = await API_GET_Product();

      const search = (id: number, myArray: TypeProduct[]) => {
        for (let i = 0; i < myArray.length; i++) {
          if (myArray[i].id === id) {
            return {
              ...myArray[i],
              _openType: 'edit',
              _receiptItemId: _receiptItemId,
              quantity: quantity,
            } as TypeProduct;
          }
        }
      };

      set({ itemSelected: search(id, isData) });
    },

    clearStoreGlobalData: () => {
      set({
        itemSelected: null,
      });
    },
  };
});
