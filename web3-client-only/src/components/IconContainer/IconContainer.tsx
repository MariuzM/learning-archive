import { type TypeColorPicker } from '../../types/theme.type';
import { Box } from '../Box/Box';

enum IconSizes {
  xs = '24px',
  sm = '36px',
  sm_plus = '50px',
  md = '70px',
  lg = '120px',
}

type TypeIconSizes = keyof typeof IconSizes;

enum BgTypes {
  round = '50%',
  square = '10%',
}

type TypeBgTypes = keyof typeof BgTypes;

export const IconContainer = ({
  bg,
  bgColor,
  fillColor,
  icon,
  size,
}: {
  bg: TypeBgTypes;
  bgColor: TypeColorPicker;
  fillColor: TypeColorPicker;
  icon: JSX.Element;
  size: TypeIconSizes;
}) => {
  return (
    <Box
      sx={(t) => {
        return {
          alignItems: 'center',
          backgroundColor: `${t.customColors[bgColor]}`,
          borderRadius: BgTypes[bg],
          display: 'flex',
          height: `calc(${IconSizes[size]} + 20px)`,
          justifyContent: 'center',
          padding: () => {
            // if (size === 'xs') return '4px';
            // if (size === 'sm') return '6px';
            if (size === 'md') return '20px';
            return '10px';
          },
          svg: { fill: `${t.customColors[fillColor]}` },
          width: `calc(${IconSizes[size]} + 20px)`,
        };
      }}
    >
      {icon}
    </Box>
  );
};
