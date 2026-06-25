import { Select } from 'antd'
import { Controller } from 'react-hook-form'

import type { FormT } from '../FormBuilder/formBuilder.type'

import { Error } from './components/Error'
import { Label } from './components/Label'

export type OptionT = {
	value: string
	label: string
	disabled?: boolean
	meta?: {
		balance?: number
	}
}

export const InputSelect = <T extends object>({
	f,
	id,
	label,
	placeholder,
	isDisabled = false,
	options = [],
	onSelect,
}: FormT<T> & {
	label: string
	placeholder?: string
	isDisabled?: boolean
	options: OptionT[]
	onSelect?: (value: string, option: OptionT) => void
}) => {
	return (
		<Controller
			name={id}
			control={f.control}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				return (
					<div>
						{label && <Label label={label} />}
						<Select
							value={value}
							onChange={(value) => {
								if (onSelect) {
									const selectedOption = options.find((opt) => opt.value === value)
									if (selectedOption) onSelect(value, selectedOption)
								}
								onChange(value)
							}}
							placeholder={placeholder}
							disabled={isDisabled}
							options={options}
							style={{ width: '100%' }}
						/>
						<Error error={error?.message} />
					</div>
				)
			}}
		/>
	)
}
