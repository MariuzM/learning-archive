import create from 'zustand';

import type { TypeReceipt, TypeReceiptItems, TypeReceiptType } from '../types/typeReceipt';
import { countAllItems } from '../utils/calc';
import { useStoreUI } from './useStoreUI';

type T = {
  receipt: TypeReceipt | null;

  createReceiptBlank: () => void;
  createReceiptFromItem: (type: TypeReceiptType, receiptItem: TypeReceiptItems) => void;
  createReceiptFromHistory: (receipt: TypeReceipt) => void;

  editReceipt: () => void;
  updateReceiptItem: (item: TypeReceiptItems) => void;

  deleteItem: (_receiptItemId: number) => void;
  deleteReceipt: () => void;
  deleteReceiptAndStoreInHistory: () => void;

  recalcReceiptPrice: () => void;
  recalcReceiptPriceV2: (receiptItem: TypeReceiptItems) => { total: number };

  receiptCounter: number;
  receiptItemCounter: number;
  receiptHistory: TypeReceipt[] | [];

  clearStoreGlobalData: () => void;
};

export const useStoreReceipt = create<T>((set, get): T => {
  return {
    receipt: null,

    // =========================================================================================

    createReceiptBlank: () => {
      const createNewReceipt = () => {
        set((s) => ({ receiptCounter: s.receiptCounter + 1 }));

        set((s) => ({
          receipt: {
            id: s.receiptCounter,
            nr: s.receiptCounter.toString(),
            type: 'Receipt',
            items: [],
          },
        }));
      };

      if (get().receipt) {
        useStoreUI.setState((s) => ({
          isModal: {
            isOpen: true,
            data: {
              title: 'New receipt',
              description: 'You have receipt already open, do you want to save it?',
              actionButtons: [
                {
                  id: '1',
                  label: 'Save',
                  onClick: () => {
                    get().deleteReceiptAndStoreInHistory();
                    createNewReceipt();
                    s.isModalSet({ isOpen: false });
                  },
                  type: 'primary',
                },
                {
                  id: '2',
                  label: 'Delete',
                  onClick: () => {
                    get().deleteReceipt();
                    createNewReceipt();
                    s.isModalSet({ isOpen: false });
                  },
                  type: 'secondary',
                },
              ],
            },
          },
        }));
      } else {
        createNewReceipt();
      }
    },

    createReceiptFromItem: (type, receiptItem) => {
      // * If Receipt is empty, create one and add item
      if (!get().receipt) {
        set((s) => ({
          receiptCounter: s.receiptCounter + 1,
        }));

        set((s) => ({
          receipt: {
            id: s.receiptCounter,
            nr: s.receiptCounter.toString(),
            type: type,
            ...(receiptItem && {
              items: [receiptItem],
              price: { total: receiptItem.amounts.price },
            }),
          },
        }));

        set({
          receiptItemCounter: 1,
        });

        console.log(get().receipt);

        return;
      }

      set((s) => {
        const newArr = [...(s.receipt?.items as TypeReceiptItems[]), receiptItem];
        return {
          receipt: {
            ...(s.receipt as TypeReceipt),
            price: { total: countAllItems(newArr) },
            items: newArr,
          },
        };
      });

      set((s) => ({
        receiptItemCounter: s.receiptItemCounter + 1,
      }));

      console.log(get().receipt);
    },

    createReceiptFromHistory: (receipt) => {
      const createNewReceipt = () => {
        // set((s) => ({ receiptCounter: s.receiptCounter + 1 }));

        set((s) => ({
          receipt: {
            ...receipt,
            // id: s.receiptCounter,
            // nr: s.receiptCounter.toString(),
            type: 'Receipt',
          },
        }));
      };

      if (get().receipt) {
        useStoreUI.setState((s) => ({
          isModal: {
            isOpen: true,
            data: {
              title: 'New receipt',
              description: 'You have receipt already open, do you want to save it?',
              actionButtons: [
                {
                  id: '1',
                  label: 'Save',
                  onClick: () => {
                    get().deleteReceiptAndStoreInHistory();
                    createNewReceipt();
                    s.isModalSet({ isOpen: false });
                  },
                  type: 'primary',
                },
                {
                  id: '2',
                  label: 'Delete',
                  onClick: () => {
                    get().deleteReceipt();
                    createNewReceipt();
                    s.isModalSet({ isOpen: false });
                  },
                  type: 'secondary',
                },
              ],
            },
          },
        }));
      } else {
        createNewReceipt();
      }
    },

    // =========================================================================================

    editReceipt: () => {
      console.log(11);
    },

    updateReceiptItem: (item) => {
      const receipt = get().receipt;

      if (receipt && receipt.items) {
        const newReceiptArr = receipt.items.map((obj) => {
          if (obj._receiptItemId === item._receiptItemId) {
            const newObj: TypeReceiptItems = {
              _receiptItemId: item._receiptItemId,
              amounts: item.amounts,
              id: item.id,
              name: item.name,
              quantity: item.quantity,
            };
            return newObj;
          } else {
            return obj;
          }
        });

        set((s) => ({
          receipt: {
            ...(s.receipt as TypeReceipt),
            items: newReceiptArr.length
              ? newReceiptArr
              : [
                  // * When in Edit / Update mode in PDP and Receipt does not have same _receiptItemId
                  {
                    _receiptItemId: get().receiptItemCounter + 1,
                    amounts: item.amounts,
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                  },
                ],
          },
        }));
      } else {
        // * When in Edit / Update mode in PDP and Receipt is null
        get().createReceiptFromItem('Receipt', {
          _receiptItemId: get().receiptItemCounter + 1,
          amounts: item.amounts,
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        });
      }

      get().recalcReceiptPrice();
    },

    // =========================================================================================

    deleteItem: (_receiptItemId) => {
      set(() => {
        const getReceipt = get().receipt;
        return {
          receipt: {
            ...getReceipt,
            items: getReceipt?.items?.filter((e) => e._receiptItemId !== _receiptItemId),
          } as TypeReceipt,
        };
      });

      get().recalcReceiptPrice();
    },

    deleteReceipt: () => {
      set({ receipt: null });
      set({ receiptItemCounter: 0 });
    },

    deleteReceiptAndStoreInHistory: () => {
      set((s) => {
        const arr = s.receiptHistory;
        const oldDetails = arr.find((obj) => obj.id === s.receipt?.id);

        if (oldDetails) {
          Object.assign(oldDetails, s.receipt);
          return { receiptHistory: arr as TypeReceipt[] };
        }

        return { receiptHistory: [...arr, { ...s.receipt }] as TypeReceipt[] };
      });
      set({ receipt: null });
      set({ receiptItemCounter: 0 });
    },

    // =========================================================================================

    recalcReceiptPrice: () => {
      set((s) => {
        return {
          receipt: {
            ...(s.receipt as TypeReceipt),
            price: { total: countAllItems(s.receipt?.items as TypeReceiptItems[]) },
          },
        };
      });
    },

    recalcReceiptPriceV2: (receiptItem) => {
      const newArr = get().receipt?.items;
      newArr?.push(receiptItem);

      return {
        total: countAllItems(newArr as TypeReceiptItems[]),
      };
    },

    // ------------------------------------------------------
    // Server
    // ------------------------------------------------------

    receiptCounter: 0,
    receiptItemCounter: 0,
    receiptHistory: [],

    // ------------------------------------------------------

    clearStoreGlobalData: () => {
      set({
        receipt: null,
        receiptCounter: 0,
        receiptHistory: [],
      });
    },
  };
});
