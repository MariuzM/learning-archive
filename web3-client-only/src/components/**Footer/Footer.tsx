import { Box } from '../Box/Box';

export const Footer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        bottom: 0,
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        width: '100%',
      }}
    >
      {children}
    </Box>
  );
};
