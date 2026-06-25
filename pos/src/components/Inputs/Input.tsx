import { useState } from 'react';

import styled from '@emotion/styled';
import { Input as MInput } from '@mantine/core';

export const Input = (p: { label: string; icon?: React.ReactNode }) => {
  const [val, valSet] = useState<string>('');

  return (
    <SDiv className="w-full">
      <MInput
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => valSet(e.target.value)}
        placeholder={p.label}
        value={val}
        {...(p.icon && { icon: p.icon })}
      />
    </SDiv>
  );
};

const SDiv = styled.div`
  input {
    transition: var(--transition);
    border-radius: var(--border-radius);

    :hover {
      transition: var(--transition);
      box-shadow: var(--box-shadow);
    }
  }
`;
