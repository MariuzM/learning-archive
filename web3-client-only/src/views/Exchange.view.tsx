import { type SxProps } from '@mui/material';

import { GetAddress } from '../components/*Web3/GetAddress';
import { Accordion } from '../components/Accordion/Accordion';
import { Box } from '../components/Box/Box';
import { BoxColored } from '../components/BoxColored/BoxColored';
import { Button } from '../components/Button/Button';
import { DividerHorizontal } from '../components/Divider/Divider';
import { InputQuantity } from '../components/Input/InputQuantity';
import { Text } from '../components/Text/Text';
import { Widget } from '../components/Widget/Widget';
import { dataAccordionHome } from '../data/accordions.data';
import { useTranslation } from '../hooks/useTranslation.hook';
import { testid } from '../utils/id.util';

export const Exchange = () => {
  const { t } = useTranslation();

  return (
    <Box
      {...testid('exchange')}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <BoxColored
        {...testid('exchange-header')}
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
            <Text variant="h5" sx={{ fontWeight: '800' }}>
              Total UTKS
            </Text>
          </Box>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
            }}
          >
            <Text variant="h4" sx={{ fontWeight: '800' }}>
              0.00
            </Text>
            <Text variant="h4" sx={(t) => ({ color: t.customColors.textPink, fontWeight: '800' })}>
              UTKS
            </Text>
          </Box>
        </Box>
      </BoxColored>

      <Box {...testid('exchange-wallets')}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 7,
            justifyContent: 'space-between',
          }}
        >
          <Wallet />
          <Wallet />
        </Box>
      </Box>

      <BoxColored>
        <Text sx={{ fontSize: '20px', mb: '5px', textAlign: 'left' }}>
          Frequently Asked Questions
        </Text>
        <Accordion data={dataAccordionHome} />
      </BoxColored>

      <Box sx={{ m: '0 auto' }}>
        <Widget />
      </Box>

      <Box sx={{ m: '0 auto' }}>
        <Text>{t('2022 All rights reserved')}</Text>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <BoxColored
        sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-between' }}
      >
        {t('Wallet')}
        <GetAddress />
      </BoxColored>

      <BoxColored>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={sGap}>
            <Text>{t('Exchange rate')}</Text>
            <Box sx={sGap}>
              <Text>1 UTKS = 1.1</Text>
              <Text sx={{ color: (t) => t.customColors.textPink }}>USDT</Text>
            </Box>
          </Box>

          <DividerHorizontal />

          <Box sx={sGap}>
            <Text>{t('Exchangable')}</Text>
            <Box sx={sGap}>
              <Text>≈ 0</Text>
              <Text sx={{ color: (t) => t.customColors.textPink }}>USDT</Text>
            </Box>
          </Box>

          <DividerHorizontal />

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
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
              }}
            >
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
