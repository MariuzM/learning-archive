import { RootLayout } from './app/_layout';
import { RealEstateService } from './app/services/real_estate';
import { HomeDolarIcon, HomeIcon } from './components/Icons';

export const ROUTES = [
  {
    id: 'Root',
    path: '/',
    element: <RootLayout />,
    children: [
      {
        id: 'Home',
        path: '/',
        icon: <HomeIcon />,
        element: <div>Home</div>,
      },
      {
        id: 'Real Estate',
        path: '/services/real-estate',
        icon: <HomeDolarIcon />,
        element: <RealEstateService />,
      },
    ],
  },
];
