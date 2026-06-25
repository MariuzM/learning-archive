import styled from '@emotion/styled';
import { ActionIcon, Group, NumberInput } from '@mantine/core';

import { useStoreUI } from '../../states/useStoreUI';
import type { TypeProduct } from '../../types/typesServerDataTypes';

export const InputQuantity = (p: {
  quantity: number;
  // quantitySet?: React.Dispatch<React.SetStateAction<number>>;
}) => {
  // const itemSelectedQuantity = useStoreUI((s) => s.itemSelected?.quantity) as number;
  const itemSelectedQuantity = p.quantity;

  return (
    <SDiv className="quantity-input">
      <Group spacing={5}>
        <ActionIcon
          size={42}
          variant="default"
          // onClick={() => ref.current && ref.current.decrement()}
          onClick={() => {
            if (itemSelectedQuantity > 1) {
              useStoreUI.setState((s) => {
                return {
                  itemSelected: {
                    ...(s.itemSelected as TypeProduct),
                    ...(s.itemSelected?._openType === 'edit' && { _openType: 'update' }),
                    quantity: itemSelectedQuantity - 1,
                  },
                };
              });
            }
          }}
        >
          -
        </ActionIcon>

        <NumberInput
          className="numeric-input"
          // handlersRef={ref}
          hideControls
          min={1}
          onChange={(v: number) => {
            if (v > 0) {
              useStoreUI.setState((s) => ({
                itemSelected: {
                  ...(s.itemSelected as TypeProduct),
                  ...(s.itemSelected?._openType === 'edit' && { _openType: 'update' }),
                  quantity: v,
                },
              }));
            }
          }}
          styles={{ input: { width: 54, height: 42, textAlign: 'center' } }}
          value={itemSelectedQuantity}
        />

        <ActionIcon
          size={42}
          variant="default"
          // onClick={() => ref.current && ref.current.increment()}
          onClick={() => {
            useStoreUI.setState((s) => {
              return {
                itemSelected: {
                  ...(s.itemSelected as TypeProduct),
                  ...(s.itemSelected?._openType === 'edit' && { _openType: 'update' }),
                  quantity: itemSelectedQuantity + 1,
                },
              };
            });
          }}
        >
          +
        </ActionIcon>
      </Group>
    </SDiv>
  );
};

const SDiv = styled.div`
  width: fit-content;

  .mantine-Group-root {
    .mantine-Group-child {
      border-radius: var(--border-radius);
    }
  }
`;
