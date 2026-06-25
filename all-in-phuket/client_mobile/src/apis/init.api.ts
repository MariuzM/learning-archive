import { req } from '../clients/axios.client';
import type { Init } from '../types/init.type';

export async function API_GET_Init() {
  const { data } = await req.get<Init[]>('/init');
  return data;
}
