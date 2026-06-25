import { Input } from 'antd'
import { Controller } from 'react-hook-form'

import type { FormT } from '../FormBuilder/formBuilder.type'

import { Error } from './components/Error'
import { Label } from './components/Label'

export const InputText = <T extends object>({
	f,
	id,
	label,
	placeholder,
	isDisabled = false,
	onKeyChange,
}: FormT<T> & {
	label: string
	placeholder?: string
	isDisabled?: boolean
	onKeyChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
	return (
		<Controller
			name={id}
			control={f.control}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				return (
					<div>
						{label && <Label label={label} />}
						<Input
							value={value}
							onChange={(e) => {
								onChange(e)
								if (onKeyChange) onKeyChange(e)
							}}
							placeholder={placeholder}
							disabled={isDisabled}
							style={{ width: '100%' }}
						/>
						<Error error={error?.message} />
					</div>
				)
			}}
		/>
	)
}
