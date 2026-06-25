import styled from '@emotion/styled';
import { Modal as MModal, useMantineTheme } from '@mantine/core';

import { useStoreUI } from '../../../states/useStoreUI';
import { Button } from '../../Buttons/Button';

export const Modal = () => {
  const isModal = useStoreUI((s) => s.isModal);
  const isModalSet = useStoreUI((s) => s.isModalSet);
  const t = useMantineTheme();

  return (
    <SDiv className="modal">
      <MModal
        centered
        onClose={() => {
          isModalSet({ isOpen: false });
        }}
        opened={isModal.isOpen}
        overlayBlur={3}
        overlayColor={t.colors.dark[9]}
        overlayOpacity={0.55}
        title={isModal.data?.title}
        transitionDuration={0}
        size="fit-content"
      >
        <div className="modal__content flex-col gap-4">
          <div className="modal__text">{isModal.data?.description}</div>

          {isModal.data?.component && (
            <div className="modal__component">{isModal.data?.component}</div>
          )}

          <div className="modal__action flex-row gap-2">
            {isModal.data?.actionButtons?.map((el) => {
              return (
                <Button
                  key={el.id}
                  color={el.type === 'primary' ? 'green' : 'red'}
                  name={el.label}
                  onClick={el.onClick}
                  variant={el.type === 'primary' ? 'filled' : 'filled'}
                />
              );
            })}
          </div>
        </div>
      </MModal>
    </SDiv>
  );
};

const SDiv = styled.div`
  .mantine-Modal-header > * {
    background-color: red;
    width: fit-content !important;
  }
`;
