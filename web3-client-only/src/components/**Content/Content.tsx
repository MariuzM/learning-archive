import { Box } from '../Box/Box';

export const Content = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          margin: { xs: '1rem auto', md: '2rem auto' },
          marginBottom: { xs: '80px', md: '0px' },
          width: { md: '100%', lg: '1200px' },
        }}
      >
        <Box sx={{ margin: '1rem' }}>{children}</Box>
      </Box>
    </main>
  );
};
