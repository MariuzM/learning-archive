import MuiButton, { type ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export const Button = ({
  isLoading,
  children,
  disabled,
  sx,
  ...r
}: { isLoading?: boolean } & ButtonProps) => {
  return (
    <MuiButton
      sx={[
        {
          padding: '10px 22px',
          backgroundColor: (t) => t.customColors.button,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...r}
      disabled={isLoading || disabled}
    >
      {isLoading && <CircularProgress size={20} color="info" sx={{ marginRight: 2 }} />}
      {children}
    </MuiButton>
  );
};
