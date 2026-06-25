import { HikingIcon, SpinIcon, SurfingIcon, WeightsIcon } from '../components/Icons';
import type { Activity } from '../types/activity.type';

export const API_Activities: Activity[] = [
  {
    id: 1,
    icon: SurfingIcon,
    image: 'https://i.postimg.cc/gJdvgtgQ/surfing-2x.png',
    name: 'Surfing',
    subtitle: 'OCEAN BEACH',
  },
  {
    id: 2,
    icon: HikingIcon,
    image: 'https://i.postimg.cc/PrL8QktN/hiking-2x.png',
    name: 'Hiking',
    subtitle: 'TORREY PINES',
  },
  {
    id: 3,
    icon: WeightsIcon,
    image: 'https://i.postimg.cc/RhT9chN2/weights-2x.png',
    name: 'Weights',
    subtitle: 'ENCINITAS',
  },
  {
    id: 4,
    icon: SpinIcon,
    image: 'https://i.postimg.cc/7hqrY4m9/spinning-2x.png',
    name: 'Spinning',
    subtitle: 'GYM',
  },
];

export const activityIcons: Record<string, React.ReactNode> = {
  Surfing: <SurfingIcon />,
  Hiking: <HikingIcon />,
  Weights: <WeightsIcon />,
  Spinning: <SpinIcon />,
};

export const API_Durations: Record<number, string> = {
  1800: '30 min',
  3600: '1 h',
  5400: '1 h 30 min',
  7200: '2 h',
  9000: '2 h 30 min',
  10800: '3 h',
  12600: '3 h 30 min',
  14400: '4 h',
  16200: '4 h 30 min',
  18000: '5 h',
};
