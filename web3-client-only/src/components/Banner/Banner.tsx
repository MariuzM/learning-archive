import StarRoundedIcon from '@mui/icons-material/StarRounded';

import banner from '../../assets/images/banner.png';
import { testid } from '../../utils/id.util';
import { Box } from '../Box/Box';
import { BoxColored } from '../BoxColored/BoxColored';
import { NextImage } from '../NextImage/NextImage';
import { Text } from '../Text/Text';

export const Banner = ({ children }: { children: React.ReactNode }) => {
  return (
    <BoxColored
      {...testid('home-banner')}
      sx={{
        padding: { xs: '20px', md: '2rem' },
      }}
    >
      <Box
        sx={{
          margin: { xs: 'auto', md: '-2rem' },
          top: '-15px',
          position: 'relative',
        }}
      >
        <NextImage src={banner} alt="banner" />
      </Box>

      {children}
    </BoxColored>
  );
};

export const LiquidityNode = () => {
  return (
    <Box
      {...testid('home-banner-container-right__liquidity-node')}
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: { xs: 'row', md: 'column' },
        gap: 1,
        height: '100%',
        justifyContent: 'space-evenly',
      }}
    >
      <Box>
        <Text variant="h3">1542853</Text>
      </Box>
      <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 1 }}>
        <StarRoundedIcon sx={(t) => ({ fill: t.customColors.orange })} />
        <Text>Liquidity node</Text>
      </Box>
    </Box>
  );
};

export const BannerMobile = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ display: { xs: 'flex', md: 'none' }, marginTop: '10px', width: '100%' }}>
      <BoxColored
        {...testid('banner')}
        sx={{
          padding: { xs: '20px', md: '2rem' },
        }}
      >
        {children}
      </BoxColored>
    </Box>
  );
};
