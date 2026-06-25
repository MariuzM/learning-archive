import { API_GET_Products } from '../../data/serverRawData';
import type { TypeProduct } from '../../types/typesServerDataTypes';

export const API_GET_Product = async (): Promise<TypeProduct[]> => {
  return API_GET_Products;
};
