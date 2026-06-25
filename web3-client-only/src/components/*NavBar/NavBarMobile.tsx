import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Fragment } from 'react';

import { routes } from '../../data/routes.data';
import { useTranslation } from '../../hooks/useTranslation.hook';
import { Box } from '../Box/Box';

export const NavBarMobile = () => {
  const { t } = useTranslation();
  const { route } = useRouter();

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: 'linear-gradient(180deg, #9D0A44 0%, #7D0624 100%)',
        display: 'flex',
        height: '60px',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <>
        <Box
          sx={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            fontSize: '10px',
            '& p': { fontSize: '10px' },
          }}
        >
          {routes.map((r, i) => {
            return (
              <Fragment key={i}>
                <Box
                  sx={{
                    '& a': {
                      color: 'white',
                      lineHeight: '10px',
                      textDecoration: 'none',
                    },
                  }}
                >
                  <NextLink href={r.path} passHref>
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      <Box
                        sx={(t) => ({
                          alignItems: 'center',
                          background: () => {
                            if (route === r.path) return t.customColors.button;
                            return t.customColors.base;
                          },
                          borderRadius: '20%',
                          display: 'flex',
                          justifyContent: 'center',
                          padding: '5px',
                          width: '25px',
                          '& svg': {
                            width: '15px',
                            height: '15px',
                            fill: () => {
                              if (route === r.path) return t.customColors.textWhite;
                              return t.customColors.button;
                            },
                          },
                        })}
                      >
                        {r.icon}
                      </Box>
                      <Box>{t(r.label)}</Box>
                    </Box>
                  </NextLink>
                </Box>
              </Fragment>
            );
          })}
        </Box>
      </>
    </Box>
  );
};
