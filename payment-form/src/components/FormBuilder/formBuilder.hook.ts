import type { DefaultValues, UseFormReturn } from 'react-hook-form'
import { useForm as useHookForm } from 'react-hook-form'
import { type ZodType } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

type UseFormOptions<T> = {
	defaultValues?: DefaultValues<T>
}

export const useForm = <T extends object>(
	schema: ZodType<T, any, unknown>,
	options: UseFormOptions<T> = {},
): UseFormReturn<T> => {
	const { defaultValues } = options
	return useHookForm<T>({
		resolver: zodResolver(schema),
		defaultValues,
	})
}

export { UseFormReturn, zodResolver as zodR }
