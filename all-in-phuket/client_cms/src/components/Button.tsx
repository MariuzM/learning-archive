import { Button as MButton } from '@mantine/core';
import { useState } from 'react';

import { Color } from '../styles/base.style';

import { PlusCircleIcon } from './Icons';
import { Spinner } from './Loaders';

export const Button = ({
  title,
  onPress,
  type = 'button',
  isSubmitting,
}: {
  title: string;
  onPress?: () => Promise<void> | void;
  type?: 'submit' | 'button';
  isSubmitting?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <MButton
      variant="outline"
      color={Color.Accent}
      style={{
        backgroundColor: Color.Bg,
      }}
      styles={{
        label: {
          gap: '8px',
        },
      }}
      type={type}
      onClick={async () => {
        setIsLoading(true);
        onPress && (await onPress());
        setIsLoading(false);
      }}
    >
      {(isSubmitting || isLoading) && <Spinner />}
      {title === 'Add New' && <PlusCircleIcon />}
      <p>{title}</p>
    </MButton>
  );
};
