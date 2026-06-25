import axios from 'axios';

import type { TypeServerErrorResponse } from '../types/typesServer';

type TypeQueryParam = {
  search?: string;
  size?: number;
  page?: number;
  filter?: string;
};

const queryParamUrlGenerator = (url: string, queryParam: TypeQueryParam) => {
  const newObj: Record<string, string> = {};
  Object.keys(queryParam).forEach((k) => {
    const val = queryParam[k as keyof TypeQueryParam];
    let newValue;
    if (typeof val === 'number') newValue = val?.toString();
    else newValue = val;
    Object.assign(newObj, { [k]: newValue });
  });
  const newUrl = url + '?' + new URLSearchParams(newObj).toString();
  return newUrl;
};

export const RESTRequestBuilder = async <T>(p: {
  reqType: 'GET' | 'POST' | 'PUT';
  queryUrl: string;
  queryParams?: TypeQueryParam;
  // headers?: {
  //   Authorization?: boolean;
  //   tenantId?: number | boolean;
  //   companyId?: boolean;
  //   cachMachineId?: boolean;
  // };
}): Promise<{
  isData: T | null;
  isError: { dataMessage: string; status: number; statusText: string } | null;
}> => {
  const API = import.meta.env.REACT_APP_API_GATEWAY;
  // const { activeIDs } = useStoreGlobalData.getState();
  // const lang = store.getState().app.lang;

  try {
    const { data } = await axios({
      method: p.reqType,
      url: `${API}${
        p.queryParams ? queryParamUrlGenerator(p.queryUrl, p.queryParams) : p.queryUrl
      }`,
      // ...(p.headers && {
      //   headers: {
      //     ...(lang && {
      //       'Accept-Language': lang,
      //     }),
      //     ...(p.headers.Authorization && {
      //       Authorization: `Bearer ${getSessionStorageItem('token.access')}`,
      //     }),
      //     ...(p.headers.tenantId && {
      //       'X-TenantId': String(
      //         (isNumber(p.headers.tenantId) && p.headers.tenantId) || activeIDs?.tenantId
      //       ),
      //     }),
      //     ...(p.headers.companyId && {
      //       'X-CompanyId': String(activeIDs?.companyId),
      //     }),
      //     ...(p.headers.cachMachineId && {
      //       'X-CashMachineId': String(activeIDs?.cashMachineId),
      //     }),
      //   },
      // }),
    });

    return {
      isData: data,
      isError: null,
    };
  } catch ({ response }) {
    const res = response as TypeServerErrorResponse;

    return {
      isData: null,
      isError: {
        dataMessage: res.data.message,
        status: res.status,
        statusText: res.statusText,
      },
    };
  }
};
