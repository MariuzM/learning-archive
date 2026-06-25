import { memo } from 'react';

import styled from '@emotion/styled';
import { Text } from '@mantine/core';

import { useStoreReceipt } from '../../states/useStoreReceipt';
import type { TypeReceiptType } from '../../types/typeReceipt';
import { Button } from '../Buttons/Button';
import { IconReceipt } from '../Icons/IconReceipt';
import { IconReceiptEmpty } from '../Icons/IconReceiptEmpty';
import { IconTrash } from '../Icons/IconTrash';
import { Price } from '../Price/Price';
import { ReceiptItems } from './components/ReceiptItems';

export const Receipt = memo(() => {
  const receipt = useStoreReceipt((s) => s.receipt);

  return (
    <SDiv className="flex-col gap-2 py-2 mr-2" receiptType={receipt?.type}>
      <div className="receipt__header flex-row items-center justify-between">
        <div className="receipt-id flex-row items-center gap-1">
          {receipt ? <IconReceipt size={35} /> : <IconReceiptEmpty size={35} />}
          <div>
            <div className="type">{receipt?.type}</div>
            <div className="nr">{receipt?.nr}</div>
          </div>
        </div>

        {receipt?.nr && (
          <div
            className="receipt-header__trash-btn"
            onClick={useStoreReceipt.getState().deleteReceiptAndStoreInHistory}
          >
            <IconTrash />
          </div>
        )}
      </div>

      <div className="receipt__items overflow-y-scroll">
        <ReceiptItems />
      </div>

      {receipt?.price ? (
        <>
          <div className="receipt__footer">
            <div className="receipt__price-container">
              <div className="receipt__price flex-row gap-2">
                <Text className="ml-auto">Price:</Text>
                <Price price={receipt.price.total} />
              </div>
            </div>
          </div>

          <div className="receipt__buy-btn">
            <Button name="Buy" color="green" fullWidth />
          </div>
        </>
      ) : null}
    </SDiv>
  );
});

const SDiv = styled.div<{ receiptType?: TypeReceiptType }>`
  height: 100%;

  .receipt__header {
    font-weight: 600;
    border-radius: var(--border-radius);
    padding: 11px;

    border: ${(p) => {
      if (!p.receiptType || p.receiptType === 'Empty') {
        return '1px solid var(--grey-darker)';
      }

      if (p.receiptType === 'Receipt Return') {
        return '1px solid var(--orange)';
      }

      return '1px solid var(--green)';
    }};

    background-color: ${(p) => {
      if (!p.receiptType || p.receiptType === 'Empty') {
        return 'var(--grey-light)';
      }

      if (p.receiptType === 'Receipt Return') {
        return 'var(--orange-light)';
      }

      return 'var(--green-light)';
    }};

    .receipt-id {
      margin-left: -5px;

      svg > line,
      svg > path {
        color: ${(p) => {
          if (!p.receiptType || p.receiptType === 'Empty') {
            return 'var(--grey-darker1)';
          }

          if (p.receiptType === 'Receipt Return') {
            return 'var(--orange-dark)';
          }

          return 'var(--green)';
        }};
      }

      .type {
        font-size: smaller;

        color: ${(p) => {
          if (!p.receiptType || p.receiptType === 'Empty') {
            return 'var(--grey-darker3)';
          }

          if (p.receiptType === 'Receipt Return') {
            return 'var(--orange-dark)';
          }

          return 'var(--green)';
        }};
      }

      .nr {
        font-size: larger;
        color: ${(p) => {
          if (p.receiptType === 'Receipt Return') {
            return 'var(--orange-dark)';
          }

          return 'var(--green-dark)';
        }};
      }
    }

    .receipt-header__trash-btn {
      cursor: pointer;

      svg > line,
      svg > path {
        color: var(--red);
      }
    }
  }

  .receipt__footer {
    margin-top: auto;
  }

  .receipt__buy-btn {
    button {
      height: 50px;
    }
  }
`;
