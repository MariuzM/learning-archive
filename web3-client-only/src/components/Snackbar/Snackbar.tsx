import MuiSnackbar, { type SnackbarProps } from '@mui/material/Snackbar';

export const Snackbar = ({ ...r }: SnackbarProps) => {
  return <MuiSnackbar autoHideDuration={700} {...r} />;
};
