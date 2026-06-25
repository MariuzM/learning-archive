import MuiLink from '@mui/material/Link';
import NextLink from 'next/link';

import { Text } from '../Text/Text';

export const Link = ({
  href,
  isActive,
  text,
}: {
  href: string;
  isActive: boolean;
  text: string;
}) => {
  return (
    <MuiLink component={NextLink} href={href} underline="none">
      <Text
        fontWeight={500}
        fontSize={20}
        sx={(t) => ({
          color: () => {
            if (isActive) return t.customColors.textWhite;
            return t.customColors.textPink;
          },
        })}
      >
        {text}
      </Text>
    </MuiLink>
  );
};
