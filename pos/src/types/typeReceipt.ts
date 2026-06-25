import type { TypeAmounts } from './typesServerDataTypes';

enum EnumReceiptTypes {
  Empty = 0,
  Receipt = 1,
  'Receipt Return' = 2,
}

export type TypeReceiptType = keyof typeof EnumReceiptTypes;

export type TypeReceiptItems = {
  _receiptItemId: number;
  id: number;
  amounts: TypeAmounts;
  name: string;
  quantity: number;
};

export type TypeReceipt = {
  id: number;
  nr: string;
  type?: TypeReceiptType;
  price?: { total: number };
  status?: 'paid' | 'unpaid' | 'pending' | 'canceled';
  items?: TypeReceiptItems[];
};
