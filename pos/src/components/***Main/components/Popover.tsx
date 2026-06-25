import type { DefaultMantineColor } from '@mantine/core';
import { Popover as MPopover, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { Button } from '../../Buttons/Button';

export const Popover = (p: {
  color: DefaultMantineColor;
  name: string;
  onClick?: () => void;
  popoverText: string;
}) => {
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <MPopover withArrow shadow="md" opened={opened}>
      <MPopover.Target>
        <div onMouseEnter={open} onMouseLeave={close} onClick={p.onClick}>
          <Button name={p.name} variant="subtle" color={p.color} />
        </div>
      </MPopover.Target>

      <MPopover.Dropdown sx={{ pointerEvents: 'none', textAlign: 'center' }}>
        <Text>{p.popoverText}</Text>
      </MPopover.Dropdown>
    </MPopover>
  );
};
