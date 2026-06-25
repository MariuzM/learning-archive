import MuiButton, { type ButtonProps } from '@mui/material/Button';

export const ButtonBig = ({ children, ...r }: ButtonProps) => {
  return (
    <MuiButton
      variant="contained"
      sx={(t) => ({
        backgroundColor: t.customColors.button,
        padding: '20px 22px',
        textTransform: 'none',
        width: '500px',
      })}
      {...r}
    >
      {children}
    </MuiButton>
  );
};
