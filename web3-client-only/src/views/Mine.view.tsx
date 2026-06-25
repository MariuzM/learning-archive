import { type SxProps } from '@mui/material';

import ImageBox from '../assets/images/Box.png';
import { GetAddress } from '../components/*Web3/GetAddress';
import { Box } from '../components/Box/Box';
import { BoxColored } from '../components/BoxColored/BoxColored';
import { Button } from '../components/Button/Button';
import { InputQuantity } from '../components/Input/InputQuantity';
import { NextImage } from '../components/NextImage/NextImage';
import { Text } from '../components/Text/Text';
import { useTranslation } from '../hooks/useTranslation.hook';
import { testid } from '../utils/id.util';

export const Mine = () => {
  const { t } = useTranslation();

  return (
    <Box
      {...testid('mine')}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <BoxColored
        {...testid('mine-header')}
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '300px',
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
          }}
        >
          <Box>
            <Text
              variant="h5"
              sx={{ display: 'flex', flexDirection: 'row', fontWeight: '800', gap: 2 }}
            >
              ID: <GetAddress />
            </Text>
          </Box>
        </Box>
      </BoxColored>

      <Box {...testid('mine-wallets')}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 7,
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Wallet />
          </Box>

          <Box sx={{ flex: 1 }}>
            <BoxColored
              sx={{
                alignItems: 'center',
                background: 'linear-gradient(104.22deg, #EE3B8C 0.54%, #790E8A 97.25%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box>
                  <NextImage src={ImageBox} alt="box" />
                </Box>
                <Text
                  sx={{
                    color: (t) => t.customColors.textWhite,
                    fontSize: '24px',
                    fontWeight: '800',
                  }}
                >
                  Invite Friends
                </Text>
                <Text
                  sx={{
                    color: (t) => t.customColors.textPink,
                    fontSize: '16px',
                  }}
                >
                  Earn Commision
                </Text>
              </Box>
              <Button
                sx={{
                  background: (t) => t.customColors.textWhite,
                  color: (t) => t.customColors.primary,
                  width: '100%',
                }}
              >
                {t('Invite')}
              </Button>
            </BoxColored>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 4, md: 7 } }}
      >
        <BoxColored title="Withdraw Wallet">
          <Box
            sx={{
              backgroundColor: (t) => t.customColors.base,
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              justifyContent: 'space-between',
              p: 2,
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
              }}
            >
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>PEOPLE</Text>
              <Text sx={{ fontSize: '14px' }}>0</Text>
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>
                {t('Total People')}
              </Text>
            </Box>

            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
              }}
            >
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>USDT</Text>
              <Text sx={{ fontSize: '14px' }}>0</Text>
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>
                {t('Today Earnings')}
              </Text>
            </Box>

            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
              }}
            >
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>UTKS</Text>
              <Text sx={{ fontSize: '14px' }}>0</Text>
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>
                {t('Today Earnings')}
              </Text>
            </Box>
          </Box>
        </BoxColored>
        <BoxColored title="My team">
          <Box
            sx={{
              backgroundColor: (t) => t.customColors.base,
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              justifyContent: 'space-between',
              p: 2,
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
              }}
            >
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>PEOPLE</Text>
              <Text sx={{ fontSize: '14px' }}>0</Text>
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>
                {t('Total People')}
              </Text>
            </Box>

            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
              }}
            >
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>USDT</Text>
              <Text sx={{ fontSize: '14px' }}>0</Text>
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>
                {t('Today Earnings')}
              </Text>
            </Box>

            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
              }}
            >
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>UTKS</Text>
              <Text sx={{ fontSize: '14px' }}>0</Text>
              <Text sx={{ color: (t) => t.customColors.textPink, fontSize: '14px' }}>
                {t('Today Earnings')}
              </Text>
            </Box>
          </Box>
        </BoxColored>
      </Box>
    </Box>
  );
};

const sGap: SxProps = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  gap: 2,
  justifyContent: 'space-between',
};

const Wallet = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <BoxColored>
        <Text sx={{ fontSize: '20px', fontWeight: '800' }}>{t('Withdraw Wallet')}</Text>
      </BoxColored>

      <BoxColored>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={sGap}>
            <Text>{t('Exchange Quantity')}</Text>
          </Box>

          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              justifyContent: 'space-between',
            }}
          >
            <InputQuantity type="number" />
            <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 1 }}>
              <Text>UTKS</Text>
              <Box
                sx={{
                  backgroundColor: (t) => t.customColors.purple,
                  borderRadius: '20px',
                  p: '5px 15px',
                }}
              >
                <Text sx={{ color: (t) => t.customColors.pink }}>Max</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </BoxColored>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button variant="contained" sx={{ textTransform: 'initial' }}>
          <Text>{t('Exchange USDT')}</Text>
        </Button>

        <Button
          variant="contained"
          sx={{ backgroundColor: (t) => t.customColors.base, textTransform: 'initial' }}
        >
          <Text>{t('Exchange Record')}</Text>
        </Button>
      </Box>
    </Box>
  );
};
