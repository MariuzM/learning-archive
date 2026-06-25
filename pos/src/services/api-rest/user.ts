import { RESTRequestBuilder } from '../requestBuilder';

export const API_GET_User = async (tenantId: number) => {
  const { isData, isError } = await RESTRequestBuilder<{ name: string }>({
    reqType: 'GET',
    queryUrl: `/organization/${tenantId}`,
  });

  return { isData, isError };
};
