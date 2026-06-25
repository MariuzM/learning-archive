import { WIDGETS } from '../../data/widget.data';
import { Box } from '../Box/Box';
import { BoxColored } from '../BoxColored/BoxColored';

export const Widget = () => {
  return (
    <BoxColored sx={{ p: 2, width: 'fit-content' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1.5,
          justifyContent: 'space-between',
        }}
      >
        {WIDGETS.map((widget, i) => {
          return (
            <Box
              key={i}
              sx={{
                alignItems: 'center',
                backgroundColor: (t) => t.customColors.base,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 40,
                justifyContent: 'center',
                minWidth: 40,
                p: 1,

                '&:hover': {
                  backgroundColor: (t) => t.customColors.purple,
                  cursor: 'pointer',
                },
              }}
            >
              {widget.icon}
            </Box>
          );
        })}
      </Box>
    </BoxColored>
  );
};
