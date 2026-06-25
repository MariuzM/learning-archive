import MuiDivider, { type DividerProps } from '@mui/material/Divider';

import { Box } from '../Box/Box';

export const Divider = ({ ...r }: DividerProps) => {
  return (
    <Box sx={{ margin: '0 2rem' }}>
      <MuiDivider sx={(t) => ({ backgroundColor: t.customColors.redLight, width: '1px' })} {...r} />
    </Box>
  );
};

export const DividerHorizontal = ({ ...r }: DividerProps) => {
  return (
    <Box>
      <MuiDivider
        sx={(t) => ({ backgroundColor: t.customColors.redLight, width: '100%' })}
        {...r}
      />
    </Box>
  );
};
