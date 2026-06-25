import { type SxProps, type Theme } from '@mui/material';
import { type ReactNode } from 'react';

import { useTranslation } from '../../hooks/useTranslation.hook';
import { testid } from '../../utils/id.util';
import { Box } from '../Box/Box';
import { Text } from '../Text/Text';

export const BoxColored = ({
  children,
  sx,
  title,
  ...r
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
  title?: string;
}) => {
  const { t } = useTranslation();

  return (
    <Box
      {...testid('box-colored')}
      sx={[
        (t) => ({
          backgroundColor: t.customColors.primary,
          borderRadius: t.customBorder.radius,
          color: t.customColors.textWhite,
          // height: 'fit-content',
          padding: '2rem',
          // width: 'fit-content',
          width: '100%',
          flex: 1,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...r}
    >
      {title && (
        <Text sx={{ fontSize: '20px', fontWeight: 'bold', mb: 2, textAlign: 'left' }}>
          {t(title)}
        </Text>
      )}
      {children}
    </Box>
  );
};
