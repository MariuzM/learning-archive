import { InputError, Modal, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';

import { Color, cssGlobal, Style } from '../../styles/base.style';
import { Button } from '../Button';
import { PlusCircleIcon } from '../Icons';
import type { Form } from '../TableBuilder/types/form.type';

export const ImageInput = ({ id, form }: { id: string; form: Form }) => {
  const [images, setImages] = useState<string[] | null>(null);

  useEffect(() => {
    if (images?.length && images?.length > 0) {
      console.log('🚀 ~ images:', images);
      form.setFieldValue(id, images);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Image setImages={setImages} />
        <Image setImages={setImages} />
        <Image setImages={setImages} />
        <Image setImages={setImages} />
      </div>
      <InputError>{form.errors[id]}</InputError>
    </div>
  );
};

const Image = ({
  setImages,
}: {
  setImages: React.Dispatch<React.SetStateAction<string[] | null>>;
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (image) {
      setImages((s) => (s ? [...s, image] : [image]));
    }
  }, [image, setImages]);

  return (
    <div>
      <div
        onClick={open}
        style={{
          alignItems: 'center',
          backgroundColor: Color.Bg,
          borderRadius: Style.RadiusSm,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          height: 100,
          justifyContent: 'center',
          width: 100,
        }}
      >
        {image ? (
          <img src={image} alt={image} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1">
            <p
              style={{ color: Color.Text, fontSize: cssGlobal.p_sm.fontSize, textAlign: 'center' }}
            >
              Image URL
            </p>
            <PlusCircleIcon color={Color.Accent} size={40} />
          </div>
        )}
      </div>

      <ImageInputModal opened={opened} close={close} setImage={setImage} />
    </div>
  );
};

export const ImageInputModal = ({
  opened,
  close,
  setImage,
}: {
  opened: boolean;
  close: () => void;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const [value, setValue] = useState<string>('');

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`Add Image`}
      centered
      styles={{
        close: { color: Color.Text, background: Color.BgDark },
        header: { backgroundColor: Color.BgDark, color: Color.Text, marginBottom: 12 },
        content: { backgroundColor: Color.BgLight },
      }}
    >
      <div className="my-4 flex w-full flex-col gap-4">
        <TextInput
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          variant="filled"
          styles={{
            input: {
              backgroundColor: Color.Bg,
              color: Color.Text,
            },
          }}
        />

        <div className="flex w-full justify-end">
          <Button
            title="Add"
            onPress={() => {
              setImage(value);
              close();
            }}
          />
        </div>
      </div>
    </Modal>
  );
};
