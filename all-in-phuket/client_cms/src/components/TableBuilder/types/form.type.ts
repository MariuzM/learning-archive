import type { UseFormReturnType } from '@mantine/form';

export type Form = UseFormReturnType<Partial<any>, (values: Partial<any>) => Partial<any>>;
