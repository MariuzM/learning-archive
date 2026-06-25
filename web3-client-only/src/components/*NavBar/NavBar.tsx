import { useRouter } from 'next/router';

import { routes } from '../../data/routes.data';
import { useTranslation } from '../../hooks/useTranslation.hook';
import { testid } from '../../utils/id.util';
import { ButtonWeb3 } from '../*Web3/ButtonWeb3';
import { Box } from '../Box/Box';
import { Link } from '../Link/Link';
import { Logo } from '../Logo/Logo';
import { Menu } from '../Menu/Menu';
import { Text } from '../Text/Text';

export const NavBar = ({ header }: { header: React.ReactNode }) => {
  const { t } = useTranslation();
  const { route } = useRouter();

  return (
    <Box
      {...testid('nav-bar')}
      sx={(t) => ({
        alignItems: 'center',
        backgroundColor: t.customColors.primary,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
      })}
    >
      <Box
        {...testid('nav-bar-container')}
        sx={{
          alignItems: 'center',
          display: 'flex',
          gap: 2,
          justifyContent: 'space-between',
          padding: '1rem',
          width: { xs: '100%', lg: '1200px' },
        }}
      >
        <Box
          {...testid('nav-bar-logo')}
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              '& svg': {
                width: { xs: '25px', sm: '30px', md: '40px' },
              },
            }}
          >
            <Logo />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Text
              variant="h5"
              sx={{ fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' }, fontWeight: 800 }}
            >
              Rosenblum
            </Text>
            <Text
              variant="h5"
              sx={{ fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' }, fontWeight: 800 }}
            >
              Exchange
            </Text>
          </Box>
        </Box>

        <Box {...testid('nav-bar-links')}>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 6, justifyContent: 'center' }}>
            {routes.map((r, i) => {
              return <Link key={i} href={r.path} text={t(r.label)} isActive={r.path === route} />;
            })}
          </Box>
        </Box>

        <Box
          sx={{ alignItems: 'center', display: 'flex', gap: 2, justifyContent: 'space-between' }}
        >
          <ButtonWeb3 />
          <Menu />
        </Box>
      </Box>

      {header}
    </Box>
  );
};
