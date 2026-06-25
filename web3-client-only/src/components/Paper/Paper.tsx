import MuiPaper, { type PaperProps } from '@mui/material/Paper';

export const Paper = ({ ...r }: PaperProps) => {
  return <MuiPaper variant="elevation" elevation={4} {...r} />;
};
