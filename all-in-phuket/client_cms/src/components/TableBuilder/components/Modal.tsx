import { Modal as MModal } from '@mantine/core';

import { textFormat } from '../../../-----SHARED-----/utils/text.util';
import { Color } from '../../../styles/base.style';
import type { Schema } from '../types/schema.type';

import { ModalForm } from './ModalForm';

export const Modal = ({
  opened,
  close,
  serviceName,
  schema,
}: {
  opened: boolean;
  close: () => void;
  serviceName: string;
  schema: Schema<any>;
}) => {
  return (
    <MModal
      opened={opened}
      onClose={close}
      title={`Add ${textFormat(serviceName)}`}
      centered
      size={'lg'}
      styles={{
        close: {
          color: Color.Text,
          background: Color.BgDark,
        },
        header: {
          backgroundColor: Color.BgDark,
          color: Color.Text,
          marginBottom: 12,
        },
        content: {
          backgroundColor: Color.BgLight,
        },
        body: {
          paddingLeft: 20,
          paddingRight: 20,
        },
      }}
    >
      <ModalForm serviceName={serviceName} schema={schema} onClose={close} />
    </MModal>
  );
};
