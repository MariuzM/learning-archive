import { type Components, type Theme } from '@mui/material';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiTextField: {
    styleOverrides: {
      root: (t) => ({
        '& .w3-root': {
          backgroundColor: t.theme.customColors.base,
          border: 'unset',
          borderRadius: '6px',
          color: t.theme.customColors.textWhite,
          '& input': {
            color: t.theme.customColors.textPink,
            height: 'auto',
            padding: '5px',
          },
          '& fieldset': {
            border: 'unset',
          },
          '&:hover fieldset': {
            border: '1px solid',
            borderColor: t.theme.customColors.textPink,
          },
        },
      }),
    },
  },
  MuiTypography: {
    styleOverrides: {
      root: (t) => ({
        padding: '0 0 0 0',
        color: t.theme.customColors.textWhite,
        '&.w3-root': {
          padding: '0',
        },
      }),
    },
  },
  MuiLink: {
    styleOverrides: {
      root: (t) => ({
        'p:hover': {
          color: t.theme.customColors.textPink,
        },
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      root: (t) => ({
        boxShadow: 'none',
        borderRadius: '6px',
        '&:hover': {
          backgroundColor: t.theme.customColors.icon,
        },
      }),
    },
  },
};
