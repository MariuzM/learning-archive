import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';

enum Token {
  AccessToken = 'access_token',
  RefreshToken = 'refreshToken',
}

// ==================================================================

export const setAccessToken = async (val: string) => {
  await setItemAsync(Token.AccessToken, val);
};

export const getAccessToken = async () => {
  return await getItemAsync(Token.AccessToken);
};

export const delAccessToken = async () => {
  await deleteItemAsync(Token.AccessToken);
};

// ==================================================================

export const setRefreshToken = async (val: string) => {
  await setItemAsync(Token.RefreshToken, val);
};

export const getRefreshToken = async () => {
  return await getItemAsync(Token.RefreshToken);
};

export const delRefreshToken = async () => {
  await deleteItemAsync(Token.RefreshToken);
};

// ==================================================================
