import styled from '@emotion/styled';
import { Text } from '@mantine/core';

import { useStoreReceipt } from '../../states/useStoreReceipt';
import { Price } from '../Price/Price';

export const ReceiptPending = () => {
  return (
    <SDiv className="">
      {/* <div className="search mb-4">
        <Text>Search</Text>
      </div> */}

      <div className="List flex-col gap-2">
        {useStoreReceipt.getState().receiptHistory?.map((e) => {
          return (
            <div
              key={e.id}
              className="receipt flex-row justify-between"
              onClick={() => useStoreReceipt.getState().createReceiptFromHistory(e)}
            >
              <div className="receipt__nr">
                <Text size="xs" color="gray">
                  Nr
                </Text>
                <Text>{e.nr}</Text>
              </div>

              <div className="receipt__items-count">
                <Text size="xs" color="gray">
                  Items
                </Text>
                <Text>{e.items?.length}</Text>
              </div>

              <div className="receipt__price-total">
                <Text size="xs" color="gray">
                  Price
                </Text>
                <Price price={e.price?.total || 0} />
              </div>
            </div>
          );
        })}
      </div>
    </SDiv>
  );
};

const SDiv = styled.div`
  max-height: 700px;
  width: 500px;

  .receipt {
    border: var(--border);
    border-radius: var(--border-radius);
    padding: 10px;

    :hover {
      cursor: pointer;
      border-color: var(--green);
    }
  }
`;
