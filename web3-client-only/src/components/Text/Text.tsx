import MuiTypography, { type TypographyProps } from '@mui/material/Typography';

export const Text = ({ children, ...r }: TypographyProps) => {
  return <MuiTypography {...r}>{children}</MuiTypography>;
};
