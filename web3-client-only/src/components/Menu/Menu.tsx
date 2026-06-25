import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MuiMenu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { localeRoute } from '../../data/routes.data';
import { Button } from '../Button/Button';

export const Menu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const i = localeRoute.findIndex((r) => r.locale === router.locale);
    setSelectedIndex(i);
  }, [router.locale]);

  const open = Boolean(anchorEl);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        aria-label="language-change-button"
        variant="contained"
        onClick={handleClick}
        sx={(t) => ({
          borderRadius: '20px',
          backgroundColor: t.customColors.base,
        })}
      >
        <KeyboardArrowDownIcon />
      </Button>

      <MuiMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'lock-button',
          role: 'listbox',
        }}
        sx={(t) => ({
          '.w3-paper': {
            backgroundColor: t.customColors.base,
            borderRadius: '20px',
            marginTop: 1,
          },
        })}
      >
        {localeRoute.map((r, i) => {
          return (
            <NextLink
              key={i}
              href={r.href}
              locale={r.locale}
              style={{ color: 'white', textDecoration: 'none' }}
            >
              <MuiMenuItem
                onClick={handleClose}
                selected={i === selectedIndex}
                sx={(t) => ({
                  '&:hover': {
                    backgroundColor: t.customColors.button,
                  },
                  '&.Mui-selected': {
                    backgroundColor: t.customColors.primary,
                    '&:hover': {
                      backgroundColor: t.customColors.primary,
                    },
                  },
                })}
              >
                {r.label}
              </MuiMenuItem>
            </NextLink>
          );
        })}
      </MuiMenu>
    </>
  );
};
