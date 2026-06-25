import styled from '@emotion/styled';
import { Badge, Button, Card, Group, Image, Popover, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useStoreReceipt } from '../../states/useStoreReceipt';
import { useStoreUI } from '../../states/useStoreUI';
import type { TypeProduct } from '../../types/typesServerDataTypes';
import { Button as CustomButton } from '../Buttons/Button';
import { Divider } from '../Divider/Divider';
import { Price } from '../Price/Price';

export const CardBox = (p: TypeProduct) => {
  const [opened, { close, open }] = useDisclosure(false);
  const createReceiptFromItem = useStoreReceipt((s) => s.createReceiptFromItem);

  return (
    <SDiv
      isPrice={!!p.amounts?.price}
      onClick={(e) => {
        useStoreUI.setState(() => ({ itemSelected: p }));
        e.stopPropagation();
      }}
    >
      <Card className="card" withBorder shadow="sm">
        <Card.Section className="card__picture relative">
          <Image
            {...(p.image.src ? { src: p.image.src, alt: p.image.alt } : { withPlaceholder: true })}
            height={200}
          />

          {p.promo && (
            <Badge className="card__badge" color="pink" variant="light">
              On Sale
            </Badge>
          )}
        </Card.Section>

        <Group className="card__title" position="apart">
          <div className="flex-row items-baseline justify-between w-full flex-wrap-reverse">
            <Text weight={500}>{p.name}</Text>
          </div>
        </Group>

        <Card.Section>
          <Divider />
        </Card.Section>

        <div className="card__price flex-row gap-1">
          <Price price={p.amounts?.price} />
        </div>

        <div className="card__add-to-basket-btn">
          {p.amounts?.price ? (
            <CustomButton
              color="green"
              name="Add to basket"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                console.log(
                  '🚀 ~ useStoreReceipt.getState().receiptItemCounter',
                  useStoreReceipt.getState().receiptItemCounter
                );

                createReceiptFromItem('Receipt', {
                  _receiptItemId: useStoreReceipt.getState().receiptItemCounter + 1,
                  amounts: p.amounts,
                  id: p.id,
                  name: p.name,
                  quantity: p.quantity,
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
  cursor: pointer;
  height: 100%;
  max-width: 400px;
  /* min-width: 270px; */
  /* width: 300px; */

  .card {
    border-color: var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
    transition: var(--transition);

    :hover {
      border-color: ${(p) => (p.isPrice ? '#40c057' : '#fa5252')};
      transition: var(--transition);
    }

    .card__picture {
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
      gap: 0;
      height: inherit;
      margin-top: 0;
    }

    .card__add-to-basket-btn {
      button {
        float: right;
      }
    }
  }
`;
