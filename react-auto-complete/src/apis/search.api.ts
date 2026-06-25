import { mockData } from '../data/mock.data';

export const searchFetch = () => {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, 10);
  });
};
