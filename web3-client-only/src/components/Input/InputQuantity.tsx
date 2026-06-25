import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { type Dispatch, type SetStateAction, useState } from 'react';

import { Box } from '../Box/Box';
import { Input } from './Input';

export const InputQuantity = ({ ...r }) => {
  const [qty, qtySet] = useState<number>(0);

  return (
    <Box
      sx={{
        backgroundColor: (t) => t.customColors.base,
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        width: 'fit-content',
      }}
    >
      <Input
        onChange={(e) => qtySet(Number(e.target.value))}
        value={qty}
        sx={{
          backgroundColor: 'none',
          borderRadius: '20px',

          '& > .w3-root': {
            height: '100%',
            pl: 2,

            ':hover': {
              borderRadius: '20px 0 0 20px',
            },
          },
        }}
      />

      <Box>
        <ButtonSelect type="increment" text={<KeyboardArrowUpIcon />} qtySet={qtySet} />
        <ButtonSelect type="decrement" text={<KeyboardArrowDownIcon />} qtySet={qtySet} />
      </Box>
    </Box>
  );
};

const ButtonSelect = ({
  type,
  text,
  qtySet,
}: {
  type?: 'increment' | 'decrement';
  text: React.ReactNode;
  qtySet: Dispatch<SetStateAction<number>>;
}) => {
  return (
    <Box
      onClick={() => {
        if (type === 'decrement') {
          qtySet((prev) => prev - 1);
          return;
        }
        qtySet((prev) => prev + 1);
      }}
      sx={{
        alignItems: 'center',
        backgroundColor: (t) => t.customColors.base,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        width: '45px',

        '& > *': {
          position: 'relative',
          left: '-2px',
        },

        '&:hover': {
          backgroundColor: (t) => t.customColors.pink,
        },
      }}
    >
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>{text}</Box>
    </Box>
  );
};
