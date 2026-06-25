import {
  Facebook,
  Instagram,
  Linkedin,
  Telegram,
  Twitter,
  Youtube,
} from '../components/Icons/Socials/Socials';

type Widget = {
  name: string;
  icon: React.ReactNode;
  url: string;
};

export const WIDGETS: Widget[] = [
  {
    name: 'Telegram',
    icon: <Telegram />,
    url: 'https://t.me/your_channel',
  },
  {
    name: 'Facebook',
    icon: <Facebook />,
    url: 'https://www.facebook.com/your_page',
  },
  {
    name: 'Twitter',
    icon: <Twitter />,
    url: 'https://twitter.com/your_page',
  },
  {
    name: 'Linkedin',
    icon: <Linkedin />,
    url: 'https://www.linkedin.com/your_page',
  },
  {
    name: 'Instagram',
    icon: <Instagram />,
    url: 'https://www.instagram.com/your_page',
  },
  {
    name: 'Youtube',
    icon: <Youtube />,
    url: 'https://www.youtube.com/your_page',
  },
];
