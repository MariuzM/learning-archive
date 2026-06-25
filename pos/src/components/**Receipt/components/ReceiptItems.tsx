import { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import { Accordion, createStyles, Group, Text } from '@mantine/core';

import { useStoreReceipt } from '../../../states/useStoreReceipt';
import { useStoreUI } from '../../../states/useStoreUI';
import { Button } from '../../Buttons/Button';
import { Price } from '../../Price/Price';

const useStyles = createStyles((t) => ({
  root: {
    backgroundColor: t.colorScheme === 'dark' ? t.colors.dark[6] : t.colors.gray[0],
    borderRadius: 'var(--border-radius)',
  },

  item: {
    backgroundColor: t.colorScheme === 'dark' ? t.colors.dark[6] : t.colors.gray[0],
    border: '1px solid transparent',
    position: 'relative',
    transition: 'transform 150ms ease',
    zIndex: 0,
    paddingLeft: 0,

    button: {
      paddingLeft: 10,
    },

    '.mantine-Accordion-content': {
      padding: '10px',
    },

    '&[data-active]': {
      backgroundColor: t.colorScheme === 'dark' ? t.colors.dark[7] : t.white,
      borderColor: t.colorScheme === 'dark' ? t.colors.dark[4] : t.colors.gray[2],
      borderRadius: 'var(--border-radius)',
      boxShadow: t.shadows.md,
      transform: 'scale(1.03)',
      zIndex: 1,
    },
  },

  chevron: {
    display: 'none',
  },
}));

export const ReceiptItems = () => {
  const [value, setValue] = useState<string | null>(null);
  const receipt = useStoreReceipt((s) => s.receipt);
  const receiptItemSelected = useStoreUI((s) => s.receiptItemSelected);
  const deleteItem = useStoreReceipt((s) => s.deleteItem);
  const { classes } = useStyles();

  useEffect(() => {
    if (receipt?.items) setValue(null);
  }, [receipt?.items]);

  return (
    <SDiv>
      <Accordion
        chevron={false}
        className={classes.root}
        classNames={classes}
        mx="auto"
        onChange={(e) => setValue(e)}
        value={value}
        variant="filled"
      >
        {receipt?.items &&
          receipt?.items.map((el, idx) => {
            return (
              <div key={idx} className="receipt-item">
                <Accordion.Item value={idx.toString()}>
                  <Accordion.Control>
                    <div className="flex-row justify-between">
                      <div className="name flex items-center text-center">
                        <Text>{el.name}</Text>
                      </div>

                      <Group>
                        <div className="quantity flex items-center justify-center">
                          <Text>{el.quantity}</Text>
                        </div>

                        <div className="price">
                          <Price price={el.amounts.price} />
                        </div>
                      </Group>
                    </div>
                  </Accordion.Control>

                  <Accordion.Panel className="drop-down">
                    <div className="flex-row justify-evenly">
                      <div
                        className="discount-btn"
                        onClick={() => {
                          console.log();
                        }}
                      >
                        <Button name="Discount" fullWidth variant="subtle" color={'blue'} />
                      </div>
                      <div
                        className="discount-edit"
                        onClick={() => {
                          receiptItemSelected({
                            _receiptItemId: el._receiptItemId,
                            id: el.id,
                            quantity: el.quantity,
                          });
                        }}
                      >
                        <Button name="Edit" fullWidth variant="subtle" />
                      </div>
                      <div
                        className="discount-remove"
                        onClick={() => {
                          deleteItem(el._receiptItemId);
                        }}
                      >
                        <Button name="Remove" fullWidth variant="subtle" color={'red'} />
                      </div>
                    </div>
                  </Accordion.Panel>
                </Accordion.Item>
              </div>
            );
          })}
      </Accordion>
    </SDiv>
  );
};

const SDiv = styled.div`
  overflow-y: scroll;
  padding: 5px 7px;

  .receipt-item {
    .quantity {
      background-color: var(--grey-darker);
      border-radius: var(--border-radius);
      height: 30px;
      min-width: 30px;
      padding: 0.5rem;
    }

    .price {
      min-width: 80px;

      .mantine-Text-root {
        float: right;
      }
    }

    .drop-down {
      .mantine-Button-root {
        padding: 5px 10px;
      }
    }
  }

  .test {
  }
`;
