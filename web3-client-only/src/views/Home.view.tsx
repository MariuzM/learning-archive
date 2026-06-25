import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import { type SxProps } from '@mui/material';

import { Accordion } from '../components/Accordion/Accordion';
import { Banner, LiquidityNode } from '../components/Banner/Banner';
import { Box } from '../components/Box/Box';
import { BoxColored } from '../components/BoxColored/BoxColored';
import { Button } from '../components/Button/Button';
import { ButtonBig } from '../components/Button/ButtonBig';
import { Divider, DividerHorizontal } from '../components/Divider/Divider';
import { IconContainer } from '../components/IconContainer/IconContainer';
import { Bonus } from '../components/Icons/Bonus';
import { Cpu } from '../components/Icons/Cpu';
import { Diagram } from '../components/Icons/Diagram';
import { Group } from '../components/Icons/Group';
import { MoneyBag } from '../components/Icons/MoneyBag';
import { Input } from '../components/Input/Input';
import { Text } from '../components/Text/Text';
import { dataAccordionHome } from '../data/accordions.data';
import { useTranslation } from '../hooks/useTranslation.hook';
import { fsfc, s } from '../styles/extra.style';
import { testid } from '../utils/id.util';

const fonts: SxProps = {
  fontSize: { xs: '10px', sm: '14px', md: '14px' },
};

export const Home = () => {
  const { t } = useTranslation();

  return (
    <Box
      {...testid('home')}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
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
              <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2 }}>
                <Text variant="h4" color="white">
                  0.00
                </Text>
                <Text variant="h4" sx={(t) => ({ color: t.customColors.textPink })}>
                  UTKS
                </Text>
              </Box>

              <Button
                {...testid('home-banner-container-left-button')}
                variant="contained"
                sx={(t) => ({
                  backgroundColor: t.customColors.button,
                  mt: { xs: '0', md: '1rem' },
                  textTransform: 'none',
                })}
              >
                {t('Participate')}
              </Button>
            </Box>

            <Divider orientation="vertical" />

            <Box
              {...testid('home-banner-container-center')}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                ...s,
              }}
            >
              <Box>
                <Text textAlign="left" mb={1} fontSize="14px">
                  {t('Address')}:
                </Text>
              </Box>

              <DividerHorizontal orientation="horizontal" />

              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  flexWrap: { xs: 'wrap', md: 'nowrap' },
                  gap: 1,
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                <Box sx={{ ...fsfc }}>
                  <Text
                    sx={(t) => ({
                      color: t.customColors.textPink,
                      ...fonts,
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    })}
                  >
                    {t('PROFIT POOL')}:
                  </Text>
                  <Text sx={{ ...fonts }}>0.00</Text>
                </Box>

                <Box sx={fsfc}>
                  <Text
                    sx={(t) => ({
                      color: t.customColors.textPink,
                      ...fonts,
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    })}
                  >
                    {t('Mining income')}:
                  </Text>
                  <Text sx={{ ...fonts }}>≈ 0%</Text>
                </Box>

                <Box sx={fsfc}>
                  <Text
                    sx={(t) => ({
                      color: t.customColors.textPink,
                      ...fonts,
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    })}
                  >
                    {t('UTKS Price')}:
                  </Text>
                  <Text sx={{ ...fonts }}>1.1000</Text>
                </Box>
              </Box>

              <DividerHorizontal orientation="horizontal" />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 3,
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Text sx={{ ...fonts, mb: '5px', textAlign: 'left' }}>
                    {t('Wallet balance')}:
                  </Text>
                  <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 1 }}>
                    <Input />
                    <ErrorRoundedIcon sx={(t) => ({ fill: t.customColors.pink })} />
                  </Box>
                </Box>
                <Box>
                  <Text sx={{ ...fonts, mb: '5px', textAlign: 'left' }}>{t('Staking APY')}:</Text>
                  <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 1 }}>
                    <Input />
                    <ErrorRoundedIcon sx={(t) => ({ fill: t.customColors.pink })} />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Divider orientation="vertical" />

            <Box
              {...testid('home-banner-container-right')}
              sx={{ ...s, display: { xs: 'none', md: 'block' } }}
            >
              <LiquidityNode />
            </Box>
          </Box>
        </Banner>
      </Box>

      <BoxColored sx={{ display: { xs: 'block', md: 'none' } }}>
        <LiquidityNode />
      </BoxColored>

      <Box
        sx={{
          display: 'flex',
          flexFlow: 'wrap',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          width: '100%',
        }}
      >
        <BoxColored
          sx={{
            flex: 1.5,
            backgroundColor: 'base',
            minWidth: '320px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexFlow: 'wrap',
              gap: '5px',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
              <IconContainer
                bg="round"
                bgColor="base"
                fillColor="orange"
                icon={<Cpu />}
                size="xs"
              />
              <Text
                sx={(t) => ({
                  color: t.customColors.textPink,
                  ...fonts,
                  mt: 2,
                  whiteSpace: 'nowrap',
                })}
              >
                Liquidity pool
              </Text>
              <Text sx={{ ...fonts, mt: 0.5 }}>15711103.00</Text>
            </Box>

            <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
              <IconContainer
                bg="round"
                bgColor="base"
                fillColor="pink"
                icon={<Group />}
                size="xs"
              />
              <Text
                sx={(t) => ({
                  color: t.customColors.textPink,
                  ...fonts,
                  mt: 2,
                  whiteSpace: 'nowrap',
                })}
              >
                Liquidity pool
              </Text>
              <Text sx={{ ...fonts, mt: 0.5 }}>15711103.00</Text>
            </Box>

            <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
              <IconContainer
                bg="round"
                bgColor="base"
                fillColor="redLight"
                icon={<Diagram />}
                size="xs"
              />
              <Text
                sx={(t) => ({
                  color: t.customColors.textPink,
                  ...fonts,
                  mt: 2,
                  whiteSpace: 'nowrap',
                })}
              >
                Liquidity pool
              </Text>
              <Text sx={{ ...fonts, mt: 0.5 }}>15711103.00</Text>
            </Box>
          </Box>
        </BoxColored>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            width: { sm: '100%', md: 'unset' },
          }}
        >
          <BoxColored>
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                height: '100%',
                justifyContent: 'space-between',
              }}
            >
              <IconContainer
                bg="round"
                bgColor="baseOrange"
                fillColor="orange"
                icon={<Bonus />}
                size="md"
              />
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Text sx={(t) => ({ color: t.customColors.textPink, ...fonts })}>
                  Presale winning rate
                </Text>
                <Text sx={{ fontSize: '24px', fontWeight: 'bold' }}>17.0019%</Text>
              </Box>
            </Box>
          </BoxColored>

          <BoxColored>
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                height: '100%',
                justifyContent: 'space-between',
              }}
            >
              <IconContainer
                bg="round"
                bgColor="purple"
                fillColor="pink"
                icon={<MoneyBag />}
                size="md"
              />
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Text sx={(t) => ({ color: t.customColors.textPink, ...fonts })}>Stake</Text>
                <Text sx={{ fontSize: '24px', fontWeight: 'bold' }}>0</Text>
              </Box>
            </Box>
          </BoxColored>
        </Box>
      </Box>

      <Box>
        <BoxColored>
          <Text sx={{ fontSize: '20px', mb: '5px', textAlign: 'left' }}>
            Frequently Asked Questions
          </Text>
          <Accordion data={dataAccordionHome} />
        </BoxColored>
      </Box>

      <Box className="justify-center">
        <ButtonBig>{t('Share Now')}</ButtonBig>
      </Box>
    </Box>
  );
};
