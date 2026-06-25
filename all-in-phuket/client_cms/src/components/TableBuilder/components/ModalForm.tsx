import { useForm } from '@mantine/form';
import { useState } from 'react';

import { camelToSnake } from '../../../-----SHARED-----/utils/formaters.util';
import { API_POST_Add_Service_Listing } from '../../../apis/main.api';
import { Button } from '../../Button';
import { ImageInput } from '../../Inputs/Image';
import { NumberInput, TextInput } from '../../Inputs/Inputs';
import { Select } from '../../Inputs/Selects';
import { FORM_FIELDS_TYPES } from '../schemas/table.schema';
import type { Schema } from '../types/schema.type';

export const ModalForm = ({
  serviceName,
  schema,
  onClose,
}: {
  serviceName: string;
  schema: Schema<any>;
  onClose: () => void;
}) => {
  const form = useForm(schema);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(formValues: any) {
    setIsLoading(true);
    await API_POST_Add_Service_Listing(serviceName, formValues);
    setIsLoading(false);
    onClose();
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={form.onSubmit(onSubmit)}>
      {Object.keys(schema.initialValues).map((field, i) => {
        const formField = FORM_FIELDS_TYPES[field];
        const fieldNameSnakeCase = camelToSnake(field);

        if (formField?.type === 'multiSelect') {
          return (
            <Select
              key={i}
              serviceName={serviceName}
              optionName={fieldNameSnakeCase}
              type="multiSelect"
              form={form.getInputProps(field)}
            />
          );
        }

        if (formField?.type === 'dropdown') {
          return (
            <Select
              key={i}
              serviceName={serviceName}
              optionName={fieldNameSnakeCase}
              type="singleSelect"
              form={form.getInputProps(field)}
            />
          );
        }

        if (formField?.type === 'imageUpload') {
          return <ImageInput key={i} id={fieldNameSnakeCase} form={form} />;
        }

        if (formField?.type === 'number') {
          return <NumberInput key={i} id={fieldNameSnakeCase} form={form.getInputProps(field)} />;
        }

        if (formField?.type === 'price') {
          return (
            <NumberInput key={i} id={fieldNameSnakeCase} form={form.getInputProps(field)} isPrice />
          );
        }

        return <TextInput key={i} id={fieldNameSnakeCase} form={form.getInputProps(field)} />;
      })}

      <div className="flex w-full justify-end">
        <Button title="Add" type="submit" isSubmitting={isLoading} />
      </div>
    </form>
  );
};
