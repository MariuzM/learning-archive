import styled from '@emotion/styled';
import { MultiSelect as MMultiSelect, Select as MSelect } from '@mantine/core';
import { useEffect, useState } from 'react';

import { textFormat } from '../../-----SHARED-----/utils/text.util';
import { API_GET_Options } from '../../apis/main.api';
import { Color } from '../../styles/base.style';

const SSelect = styled(MSelect)`
  /* .mantine-Input-input {
    :focus {
      border-color: ${Color.Accent};
    }
  } */
`;

const SMultiSelect = styled(MMultiSelect)`
  /* .mantine-Input-input {
    :focus,
    :focus-within {
      border-color: ${Color.Accent};
    }
  } */
`;

export const Select = ({
  serviceName,
  optionName,
  type,
  form,
}: {
  serviceName: string;
  optionName: string;
  type: 'singleSelect' | 'multiSelect';
  form: any;
}) => {
  const [items, setItems] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    (async () => {
      const res = await API_GET_Options(serviceName, optionName);
      setItems(res.map((item) => ({ value: item, label: textFormat(item) })));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (type === 'singleSelect') {
    return (
      <SSelect
        {...form}
        allowDeselect
        clearable
        data={items}
        placeholder={`Pick ${textFormat(optionName)}`}
        searchable
        variant="filled"
        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
        styles={{
          input: {
            backgroundColor: Color.Bg,
            color: Color.Text,
          },
          dropdown: {
            backgroundColor: Color.Bg,
            color: Color.Text,
            border: `1px solid ${Color.Accent}`,
          },
        }}
      />
    );
  }

  return (
    <SMultiSelect
      {...form}
      clearable
      data={items}
      placeholder={`Pick ${textFormat(optionName)}`}
      searchable
      variant="filled"
      comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
      styles={{
        input: {
          backgroundColor: Color.Bg,
          color: Color.Text,
        },
        dropdown: {
          backgroundColor: Color.Bg,
          color: Color.Text,
          border: `1px solid ${Color.Accent}`,
        },
        pill: {
          backgroundColor: Color.Accent,
          color: Color.Bg,
        },
      }}
    />
  );
};
