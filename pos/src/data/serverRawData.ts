import type { TypeProduct } from '../types/typesServerDataTypes';

export const API_GET_User = {
  id: 1,
  name: 'Marius',
  active: true,
  favSettings: {
    active: [
      { id: 1, name: 'Receipt new' },
      { id: 3, name: 'Receipt return new' },
      { id: 4, name: 'Receipt return by receipt' },
      { id: 5, name: 'Receipt pending' },
    ],
    sub: [{ id: 6, name: 'Order imports' }],
  },
};

// ------------------------------------------------------------

export const API_GET_Client = {
  id: 1,
  name: 'Tom',
  active: true,
};

export const API_GET_Clients = [
  { id: 2, name: 'God', active: true },
  { id: 3, name: 'Andrew', active: true },
];

// ------------------------------------------------------------

// export const API_GET_Product = {
//   id: 1,
//   active: true,
//   amounts: { discount: { percentage: 23, finalAmount: 44 }, price: 2222, priceTax: 2233 },
//   barcode: null,
//   group: 1,
//   name: 'Product 1',
//   quantityWarehouse: 10,
// };

export const API_GET_Products: TypeProduct[] = [
  {
    id: 1,
    active: true,
    amounts: { price: 1.22 },
    barcode: null,
    group: 1,
    name: 'Product 1',
    quantity: 1,
    quantityWarehouse: 10,
    image: {
      src: 'https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      alt: 'test',
    },
    promo: true,
  },
  {
    id: 2,
    active: true,
    amounts: { price: 3 },
    barcode: 1111111111,
    group: 1,
    name: 'Product 2 - Barcode',
    quantity: 1,
    quantityWarehouse: 5,
    image: {
      src: 'https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      alt: 'test',
    },
    promo: true,
  },
  {
    id: 3,
    active: true,
    amounts: { price: 0 },
    barcode: null,
    group: 1,
    name: 'Product 3 - No price',
    quantity: 0,
    quantityWarehouse: 0,
    image: {
      src: '',
      alt: '',
    },
    promo: false,
  },
];

// ------------------------------------------------------------

export const API_GET_Product_Group = {};
export const API_GET_Product_Groups = [{}];

export const API_GET_Receipt = {};
export const API_POST_Receipt = {};
export const API_GET_Receipts = [{}];
export const API_GET_Receipts_Pending = [{}];
