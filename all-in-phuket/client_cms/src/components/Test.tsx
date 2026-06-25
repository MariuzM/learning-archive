import { Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export function Demo() {
  const form = useForm({
    initialValues: {
      email: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  return (
    <form onSubmit={form.onSubmit((v) => console.log(v))}>
      <TextInput placeholder="your@email.com" {...form.getInputProps('email')} />
      <Button type="submit">Submit</Button>
    </form>
  );
}
