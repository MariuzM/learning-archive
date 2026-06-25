import { Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';

import { camelToSnake } from '../../-----SHARED-----/utils/formaters.util';
import { textFormat } from '../../-----SHARED-----/utils/text.util';
import { API_GET_Service_Listings } from '../../apis/main.api';
import { Color, Style } from '../../styles/base.style';
import { Button } from '../Button';

import { Modal } from './components/Modal';
import { COLUMN_NAMES_OBJECT } from './schemas/table.schema';
import type { Schema } from './types/schema.type';

export const TableBuilder = <T extends object>({
  serviceName,
  schema,
}: {
  serviceName: 'real_estate';
  schema: Schema<T>;
}) => {
  const [rows, setRows] = useState([]);
  const tableFields = ['id', ...Object.keys(schema.initialValues), 'createdAt'];

  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    (async () => {
      const data = await API_GET_Service_Listings(serviceName);
      setRows(data);
    })();
  }, [serviceName]);

  return (
    <div>
      <div className="mb-4 flex flex-row items-center justify-between">
        <h1 className="text-4xl font-bold" style={{ color: Color.Text }}>
          {textFormat(serviceName)}
        </h1>

        <Button title="Add New" onPress={open} />
      </div>

      <Table.ScrollContainer
        minWidth={400}
        style={{ backgroundColor: Color.BgLight, borderRadius: Style.RadiusSm, color: Color.Text }}
      >
        <Table
          // striped
          // withRowBorders={false}
          borderColor={Color.BgDark}
          highlightOnHover
          highlightOnHoverColor={Color.BgDark}
          stickyHeader
          stripedColor={Color.BgDark}
        >
          <Table.Thead style={{ backgroundColor: Color.BgDark }}>
            <Table.Tr>
              {tableFields.map((col, i) => {
                const v = COLUMN_NAMES_OBJECT[col];
                return (
                  <Table.Th key={i} style={{ minWidth: v?.width }}>
                    {textFormat(camelToSnake(col))}
                  </Table.Th>
                );
              })}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {rows.map((row, i) => {
              return (
                <Table.Tr key={i} style={{ borderColor: Color.BgDark }}>
                  {tableFields.map((col, _i) => {
                    const v = COLUMN_NAMES_OBJECT[col];
                    return (
                      <Table.Td
                        key={_i}
                        className={v?.editable ? 'cursor-pointer hover:bg-neutral-700' : ''}
                      >
                        {v?.formater ? v.formater(row[col]) : row[col]}
                      </Table.Td>
                    );
                  })}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Modal opened={opened} close={close} serviceName={serviceName} schema={schema} />
    </div>
  );
};
