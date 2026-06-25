import type { Path, UseFormReturn } from 'react-hook-form'

export type FormT<T extends object> = {
	f: UseFormReturn<T>
	id: Path<T>
}

export type UseFormT<T extends object> = UseFormReturn<T>
