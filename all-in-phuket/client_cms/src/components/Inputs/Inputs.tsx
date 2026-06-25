import { NumberInput as MNumberInput, TextInput as MTextInput } from '@mantine/core';

import { textFormat } from '../../-----SHARED-----/utils/text.util';
import { Color } from '../../styles/base.style';

export const TextInput = ({ id, form }: { id: string; form: any }) => {
  return (
    <MTextInput
      {...form}
      placeholder={textFormat(id)}
      variant="filled"
      styles={{
        input: {
          backgroundColor: Color.Bg,
          color: Color.Text,
        },
      }}
    />
  );
};

export const NumberInput = ({
  id,
  form,
  isPrice,
}: {
  id: string;
  form: any;
  isPrice?: boolean;
}) => {
  return (
    <MNumberInput
      {...form}
      placeholder={textFormat(id)}
      {...(isPrice && {
        thousandSeparator: ',',
        prefix: '฿ ',
      })}
      variant="filled"
      hideControls
      styles={{
        input: {
          backgroundColor: Color.Bg,
          color: Color.Text,
        },
      }}
    />
  );
};
