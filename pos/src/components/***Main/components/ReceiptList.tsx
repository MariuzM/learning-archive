import styled from '@emotion/styled';
import { openSpotlight, SpotlightAction, SpotlightProvider } from '@mantine/spotlight';

import { IconSearch } from '../../Icons/IconSearch';
const actions: SpotlightAction[] = [
  {
    title: 'Home',
    description: 'Get to home page',
    onTrigger: () => console.log('Home'),
    // icon: <IconHome size={18} />,
  },
  {
    title: 'Dashboard',
    description: 'Get full information about current system status',
    onTrigger: () => console.log('Dashboard'),
    // icon: <IconDashboard size={18} />,
  },
  {
    title: 'Documentation',
    description: 'Visit documentation to lean more about all features',
    onTrigger: () => console.log('Documentation'),
    // icon: <IconFileText size={18} />,
  },
];

export const ReceiptList = () => {
  return (
    <SDiv className="">
      <SpotlightProvider
        actions={actions}
        searchIcon={<IconSearch size={18} />}
        searchPlaceholder="Search..."
        shortcut="mod + shift + 1"
        nothingFoundMessage="Nothing found..."
      >
        <div>Test</div>
      </SpotlightProvider>
    </SDiv>
  );
};

const SDiv = styled.div``;
