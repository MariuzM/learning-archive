import styled from '@emotion/styled';
import { Badge, Button, Card, Group, Image, Popover, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useStoreReceipt } from '../../states/useStoreReceipt';
import { useStoreUI } from '../../states/useStoreUI';
import type { TypeProduct } from '../../types/typesServerDataTypes';
import { Button as CustomButton } from '../Buttons/Button';
import { Divider } from '../Divider/Divider';
import { IconX } from '../Icons/IconX';
import { QuantityPrice } from './components/QuantityPrice';

export const CardItemDetailed = (p: { itemSelected: TypeProduct }) => {
  const [opened, { close, open }] = useDisclosure(false);
  const createReceiptFromItem = useStoreReceipt((s) => s.createReceiptFromItem);
  const updateReceiptItem = useStoreReceipt((s) => s.updateReceiptItem);

  return (
    <SDiv isPrice={!!p.itemSelected.amounts?.price}>
      <Card className="card-item-detailed" withBorder shadow="sm">
        <Card.Section className="card__picture relative">
          <div
            className="close-btn"
            onClick={() => useStoreUI.setState(() => ({ itemSelected: null }))}
          >
            <IconX />
          </div>

          <Image
            {...(p.itemSelected.image.src
              ? { src: p.itemSelected.image.src, alt: p.itemSelected.image.alt }
              : { withPlaceholder: true })}
            height={400}
            width={500}
          />

          {p.itemSelected.promo && (
            <Badge className="card__badge" color="pink" variant="light">
              On Sale
            </Badge>
          )}
        </Card.Section>

        <Group className="card__title" position="apart">
          <div className="flex-row items-baseline justify-between w-full">
            <Text weight={500}>{p.itemSelected.name}</Text>
          </div>

          <Text weight={200} size="xs">
            {p.itemSelected.barcode || '-'}
          </Text>
        </Group>

        <Card.Section>
          <Divider />
        </Card.Section>

        <QuantityPrice price={p.itemSelected.amounts?.price} quantity={p.itemSelected.quantity} />

        <div className="card__add-to-basket-btn">
          {p.itemSelected.amounts?.price ? (
            <CustomButton
              color="green"
              fullWidth
              name={
                p.itemSelected._openType === 'edit'
                  ? 'Close'
                  : p.itemSelected._openType === 'update'
                  ? 'Update'
                  : 'Add to basket'
              }
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();

                if (p && p.itemSelected._openType === 'update') {
                  updateReceiptItem({
                    _receiptItemId: p.itemSelected._receiptItemId as number,
                    amounts: { price: p.itemSelected.amounts.price * p.itemSelected.quantity },
                    id: p.itemSelected.id,
                    name: p.itemSelected.name,
                    quantity: p.itemSelected.quantity,
                  });
                  return;
                }

                if (p && p.itemSelected._openType === 'edit') {
                  useStoreUI.setState(() => ({ itemSelected: null }));
                  return;
                }

                createReceiptFromItem('Receipt', {
                  _receiptItemId: useStoreReceipt.getState().receiptItemCounter + 1,
                  amounts: { price: p.itemSelected.amounts.price * p.itemSelected.quantity },
                  id: p.itemSelected.id,
                  name: p.itemSelected.name,
                  quantity: p.itemSelected.quantity,
                });
              }}
            />
          ) : (
            <Popover position="bottom" withArrow shadow="md" opened={opened}>
              <Popover.Target>
                <Button
                  style={{ cursor: 'not-allowed' }}
                  onMouseEnter={open}
                  onMouseLeave={close}
                  color="red"
                  variant="outline"
                  fullWidth
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                  }}
                >
                  No price
                </Button>
              </Popover.Target>
              <Popover.Dropdown sx={{ pointerEvents: 'none' }}>No price</Popover.Dropdown>
            </Popover>
          )}
        </div>
      </Card>
    </SDiv>
  );
};

const SDiv = styled.div<{ isPrice?: boolean }>`
  border-radius: var(--border-radius);
  height: 100%;
  margin: 0 10px 0 0;
  overflow-y: scroll;

  .card-item-detailed {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: scroll;
    /* height: max-content; */
    /* height: 100%; */

    :hover {
      transition: var(--transition);
      border-color: ${(p) => (p.isPrice ? '#40c057' : '#fa5252')};
    }

    .card__picture {
      .close-btn {
        cursor: pointer;
        padding: 10px;
        position: absolute;
        right: 15px;
        top: 15px;
        transition: var(--transition);
        z-index: 1;

        :hover {
          background-color: #ffffff5f;
          border-radius: 100%;
          transition: var(--transition);
        }
      }

      .card__badge {
        border-radius: var(--border-radius);
        bottom: 10px;
        height: fit-content;
        padding: 7px;
        position: absolute;
        right: 10px;
        width: 80px;

        span {
          text-align: center;
          white-space: pre-line;
        }
      }
    }

    .card__title {
      align-items: baseline;
      height: inherit;
      gap: 0;

      .card__badge {
        width: 80px;
      }
    }

    .card__add-to-basket-btn {
      button {
        float: right;
      }
    }
  }
`;
