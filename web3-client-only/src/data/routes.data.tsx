import { SmallHut } from '../components/Icons/SmallHut';
import { SmallLineChart } from '../components/Icons/SmallLineChart';
import { SmallMore } from '../components/Icons/SmallMore';
import { SmallStats } from '../components/Icons/SmallStats';
import { type TypeLocaleRoute, type TypeRoute } from '../types/general.type';
import { t } from '../utils/common';

export const localeRoute: TypeLocaleRoute[] = [
  {
    href: '/',
    label: 'English',
    locale: 'en',
  },
  {
    href: '/',
    label: 'Lithuanian',
    locale: 'lt',
  },
  {
    href: '/',
    label: 'Ukrainian',
    locale: 'ua',
  },
  {
    href: '/',
    label: 'Chinese',
    locale: 'zh',
  },
  {
    href: '/',
    label: 'South Korean',
    locale: 'ko',
  },
  {
    href: '/',
    label: 'Thai',
    locale: 'th',
  },
];

export const routes: TypeRoute[] = [
  {
    path: '/',
    label: t('Home'),
    icon: <SmallStats />,
  },
  {
    path: '/exchange',
    label: t('Exchange'),
    icon: <SmallHut />,
  },
  {
    path: '/serve',
    label: t('Serve'),
    icon: <SmallLineChart />,
  },
  {
    path: '/mine',
    label: t('Mine'),
    icon: <SmallMore />,
  },
];
