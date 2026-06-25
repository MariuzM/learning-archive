import TextField, { type TextFieldProps } from '@mui/material/TextField';

export const Input = ({ ...r }: TextFieldProps) => {
  return <TextField {...r} />;
};
