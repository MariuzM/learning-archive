import { type SxProps } from '@mui/material';

import { Accordion } from '../components/Accordion/Accordion';
import { Banner } from '../components/Banner/Banner';
import { Box } from '../components/Box/Box';
import { BoxColored } from '../components/BoxColored/BoxColored';
import { IconContainer } from '../components/IconContainer/IconContainer';
import { Growth } from '../components/Icons/Growth';
import { LineChart } from '../components/Icons/LineChart';
import { Logout } from '../components/Icons/Logout';
import { MoneyBig } from '../components/Icons/MoneyBig';
import { MoneyV2 } from '../components/Icons/MoneyV2';
import { Transfer } from '../components/Icons/Transfer';
import { NextImage } from '../components/NextImage/NextImage';
import { Text } from '../components/Text/Text';
import { dataAccordionServe } from '../data/accordions.data';
import { CORPORATE } from '../data/corporate.data';
import { TABLE } from '../data/table.data';
import { useTranslation } from '../hooks/useTranslation.hook';
import { s } from '../styles/extra.style';
import { t } from '../utils/common';
import { testid } from '../utils/id.util';

const fonts: SxProps = {
  fontSize: { xs: '10px', sm: '14px', md: '14px' },
};

export const Serve = () => {
  const locale = useTranslation();

  return (
    <Box {...testid('serve')} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Banner>
          <Box
            {...testid('home-banner-container')}
            sx={{
              display: 'flex',
              flexFlow: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              mt: '2rem',
            }}
          >
            <Box
              {...testid('home-banner-container-left')}
              sx={{
                ...s,
                alignItems: { xs: 'center', md: 'flex-start' },
                display: { xs: 'flex', md: 'block' },
                flexDirection: 'row',
                gap: 2,
                justifyContent: 'space-between',
                margin: 'auto',
              }}
            >
              <Box>
                <Box>
                  <Text variant="h6" sx={{ textAlign: 'left' }}>
                    {locale.t('UTKS new generation mobile node mining')}
                  </Text>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 2,
                    justifyContent: 'space-evenly',
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      width: '210px',
                    }}
                  >
                    <IconContainer
                      bg="round"
                      bgColor="base_green"
                      fillColor="icon_green"
                      icon={<Transfer />}
                      size="xs"
                    />
                    <Text sx={{ ...fonts, mt: 2, whiteSpace: 'nowrap' }}>
                      {locale.t('No need to transfer currency')}
                    </Text>
                  </Box>

                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      width: '210px',
                    }}
                  >
                    <IconContainer
                      bg="round"
                      bgColor="base_purple"
                      fillColor="pink"
                      icon={<Growth />}
                      size="xs"
                    />
                    <Text sx={{ ...fonts, mt: 2, whiteSpace: 'nowrap' }}>
                      {locale.t('Stable income')}
                    </Text>
                  </Box>

                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      width: '210px',
                    }}
                  >
                    <IconContainer
                      bg="round"
                      bgColor="baseOrange"
                      fillColor="orange"
                      icon={<Logout />}
                      size="xs"
                    />
                    <Text sx={{ ...fonts, mt: 2, whiteSpace: 'nowrap' }}>
                      {locale.t('Free exit')}
                    </Text>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, textAlign: 'left' }}>
                  <Text sx={{ color: (t) => t.customColors.textPink }}>
                    {locale.t(
                      `Committed to building the world's largest DeFi platform integrating`
                    )}
                  </Text>
                  <Text>DEX</Text>
                  <Text>IMO</Text>
                  <Text sx={{ color: (t) => t.customColors.textPink }}>and</Text>
                  <Text>DAO</Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </Banner>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <BoxColored sx={{ minWidth: '350px' }}>
          <Box sx={{ alignItems: 'flex-start', display: 'flex', flexDirection: 'row', gap: 2 }}>
            <IconContainer
              bg="square"
              bgColor="base_green"
              fillColor="icon_green"
              icon={<MoneyBig />}
              size="sm_plus"
            />
            <Box>
              <Text sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                {locale.t('No need to transfer currency')}
              </Text>

              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>
                {locale.t('No need to transfer currency, USDT deposit in your own wallet 0 risk')}
              </Text>
            </Box>
          </Box>
        </BoxColored>

        <BoxColored sx={{ minWidth: '350px' }}>
          <Box sx={{ alignItems: 'flex-start', display: 'flex', flexDirection: 'row', gap: 2 }}>
            <IconContainer
              bg="square"
              bgColor="base_purple"
              fillColor="pink"
              icon={<LineChart />}
              size="sm_plus"
            />
            <Box>
              <Text sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                {locale.t('Professional stability')}
              </Text>

              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>
                {locale.t('Professional team, stable operation throughout the year')}
              </Text>
            </Box>
          </Box>
        </BoxColored>

        <BoxColored sx={{ minWidth: '350px' }}>
          <Box sx={{ alignItems: 'flex-start', display: 'flex', flexDirection: 'row', gap: 2 }}>
            <IconContainer
              bg="square"
              bgColor="baseOrange"
              fillColor="orange"
              icon={<MoneyV2 />}
              size="sm_plus"
            />
            <Box>
              <Text sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                {locale.t('Low entry barrier')}
              </Text>
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>
                {locale.t('Sharing node mining revenue')}
              </Text>
            </Box>
          </Box>
        </BoxColored>
      </Box>

      <BoxColored title={t('Project Features')}>
        <Box sx={{ m: '0 100px' }}>
          {TABLE.map((items, i) => (
            <Box
              key={i}
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                justifyContent: 'space-between',
                p: '5px 20px',
                '&:nth-of-type(odd)': {
                  backgroundColor: (t) => t.customColors.base,
                },
              }}
            >
              {items.map((item, _i) => (
                <Text
                  key={_i}
                  sx={{
                    color: (t) => t.customColors.textPink,
                    fontSize: '14px',
                  }}
                >
                  {item}
                </Text>
              ))}
            </Box>
          ))}
        </Box>
      </BoxColored>

      <BoxColored title={t('Frequently Asked Questions')}>
        <Accordion data={dataAccordionServe} />
      </BoxColored>

      <BoxColored title={t('Cooperation Platform')}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
          }}
        >
          {CORPORATE.map((item, i) => (
            <Box
              key={i}
              sx={{
                alignItems: 'center',
                backgroundColor: (t) => t.customColors.base,
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                p: '10px 30px',
                width: '210px',
              }}
            >
              <Box sx={{ height: '30px', width: '30px' }}>
                <NextImage src={item.src} alt="test" />
              </Box>
              <Text
                sx={{
                  color: (t) => t.customColors.textPink,
                }}
              >
                {item.title}
              </Text>
            </Box>
          ))}
        </Box>
      </BoxColored>
    </Box>
  );
};
