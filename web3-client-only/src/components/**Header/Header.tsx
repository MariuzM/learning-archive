import { Box } from '../Box/Box';

export const Header = ({ children }: { children: React.ReactNode }) => {
  return (
    <header>
      <Box>{children}</Box>
    </header>
  );
};
