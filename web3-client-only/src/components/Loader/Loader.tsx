import CircularProgress from '@mui/material/CircularProgress';

import { Box } from '../Box/Box';

export const Loader = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CircularProgress />
    </Box>
  );
};
