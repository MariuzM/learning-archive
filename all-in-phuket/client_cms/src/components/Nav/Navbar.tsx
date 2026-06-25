import { ScrollArea } from '@mantine/core';
import { IconNotes } from '@tabler/icons-react';

import { LinksGroup } from './LinksGroup';
import css from './Navbar.module.css';

const ROUTES = [
  {
    label: 'Services',
    icon: IconNotes,
    initiallyOpened: true,
    links: [{ label: 'Real Estate', link: '/' }],
  },
];

export const Navbar = () => {
  const links = ROUTES.map((item) => <LinksGroup {...item} key={item.label} />);

  return (
    <nav
      className={css.navbar}
      style={{
        minWidth: '200px',
      }}
    >
      <ScrollArea className={css.links}>
        <div className={css.linksInner}>{links}</div>
      </ScrollArea>
    </nav>
  );
};
