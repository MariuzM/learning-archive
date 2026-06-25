import type { AxiosError } from 'axios';
import axios, { isAxiosError } from 'axios';

import { Err } from '../-----SHARED-----/enums/errors.enum';
import { useStateUser } from '../states/user.state';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../utils/token.util';

export const req = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

req.interceptors.request.use(
  async (req) => {
    const token: any = await getAccessToken();
    if (token) req.headers.Authorization = token;
    return req;
  },
  (err) => {
    console.log('🚀 ~ req err:', err);
    return err;
  },
);

req.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err: Error | AxiosError) => {
    if (isAxiosError(err)) {
      const prevReq: any = err.config;

      if (err.response?.data.message === Err.TOKEN_EXPIRED && !prevReq._retry) {
        prevReq._retry = true;
        const refreshToken = await getRefreshToken();
        const res = await req.post('/refresh', { refreshToken });
        const { data } = res;

        if (data) {
          prevReq.headers.Authorization = data.accessToken;
          setAccessToken(data.accessToken);
          setRefreshToken(data.refreshToken);
          return req(prevReq);
        }

        useStateUser.getState().logout();
      }

      if (err.response?.data.message === Err.USER_NOT_FOUND) {
        useStateUser.getState().logout();
      }

      setTimeout(() => {
        console.log(111);
      }, 200);
      return err;
    } else {
      console.log('🚀 ~ Res Err Stock', err.message);
      return err.message;
    }
  },
);
