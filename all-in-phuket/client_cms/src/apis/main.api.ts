import { req } from '../clients/axios.client';

export async function API_GET_Options(service: string, option: string) {
  const { data } = await req.get<string[]>(`/get-options?service=${service}&option=${option}`);
  return data;
}

export async function API_GET_Service_Listings(service: string) {
  const { data } = await req.get(`/get-service-listings?service=${service}`);
  return data;
}

export async function API_POST_Add_Service_Listing(service: string, data: any) {
  const res = await req.post(`/add-service-listing?service=${service}`, data);
  return res;
}
