import styled from '@emotion/styled';
import { type ButtonVariant, type DefaultMantineColor, Button as MButton } from '@mantine/core';

export const Button = (p: {
  color?: DefaultMantineColor;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  isIconCenter?: boolean;
  name?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: ButtonVariant;
}) => {
  return (
    <SDiv isIconCenter={p.isIconCenter && !p.name}>
      <MButton
        {...(p.color && { color: p.color })}
        {...(p.onClick && { onClick: p.onClick })}
        {...(p.variant && { variant: p.variant })}
        {...(p.icon && { rightIcon: p.icon })}
        {...(p.fullWidth && { fullWidth: true })}
      >
        {p.name}
      </MButton>
    </SDiv>
  );
};

const SDiv = styled.div<{ isIconCenter?: boolean }>`
  button {
    ${(p) => p.isIconCenter && { padding: '15px 12px' }}

    .mantine-Button-icon {
      margin-left: 0;
    }
  }
`;
