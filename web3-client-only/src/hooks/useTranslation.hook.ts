import { useTranslation as nextUseTranslation } from 'next-i18next';

export const useTranslation = () => {
  const { t } = nextUseTranslation();
  return { t };
};
