import styled from '@emotion/styled';

import { ReceiptPending } from '../*ModalLists/ReceiptPending';
import { useStoreReceipt } from '../../states/useStoreReceipt';
import { useStoreUI } from '../../states/useStoreUI';
import { Button } from '../Buttons/Button';
import { Popover } from './components/Popover';

const btn = [
  {
    name: 'F1',
    color: 'green',
    popover: 'New receipt',
    onClick: useStoreReceipt.getState().createReceiptBlank,
  },
  {
    name: 'F2',
    color: 'green',
    popover: 'Saved receipts',
    onClick: () => {
      useStoreUI.setState((s) => ({
        isModal: {
          isOpen: true,
          data: {
            title: 'Saved Receipts',
            description: '',
            component: <ReceiptPending />,
          },
        },
      }));
    },
  },
  {
    name: 'F3',
    color: 'orange',
    popover: 'New return',
    // onClick: () => useStoreReceipt.getState().createReceiptBlank,
  },
];

export const Footer = () => {
  return (
    <SDiv className="footer block-padding flex-row items-center justify-between gap-4">
      <div className="action-btn-container flex-row gap-1">
        {btn.map((e, idx) => {
          return (
            <Popover
              key={idx}
              color={e.color}
              name={e.name}
              popoverText={e.popover}
              {...(e.onClick && { onClick: e.onClick })}
            />
          );
        })}
      </div>

      <div>
        <Button name="M" />
      </div>
    </SDiv>
  );
};

const SDiv = styled.div`
  bottom: 0px;
  min-height: 70px;
  width: 100%;
`;
