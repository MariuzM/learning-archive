import { DataLocales } from '../data/locales.data';

export type TypeRoute = {
  path: string;
  label: string;
  icon?: React.ReactNode;
};

export type TypeLocales = `${DataLocales}`;

export type TypeLocaleRoute = {
  href: string;
  label: string;
  locale: `${DataLocales}`;
};

export type TypeLanguages = 'en' | 'lt';
