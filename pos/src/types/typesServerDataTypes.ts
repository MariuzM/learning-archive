export type TypeAmounts = {
  price: number;
};

export type TypeProduct = {
  _openType?: 'view' | 'edit' | 'update';
  _receiptItemId?: number;
  id: number;
  active: boolean;
  amounts: TypeAmounts;
  barcode: number | null;
  group: number;
  name: string;
  quantity: number;
  quantityWarehouse: number;
  image: { src: string; alt: string };
  promo: boolean;
};
