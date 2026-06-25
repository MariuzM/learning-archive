import { InputNumber as AntdInputNumber } from 'antd'
import { Controller } from 'react-hook-form'

import { formatNumber, getLocale } from '../../utils/i18n.util'
import type { FormT } from '../FormBuilder/formBuilder.type'

import { Error } from './components/Error'
import { Label } from './components/Label'

export const InputNumber = <T extends object>({
	f,
	id,
	label,
	placeholder,
	isDisabled = false,
	isPrice = false,
}: FormT<T> & {
	label: string
	placeholder?: string
	isDisabled?: boolean
	isPrice?: boolean
}) => {
	const locale = getLocale()
	const usesCommaDecimal = locale === 'lt-LT'
	return (
		<Controller
			name={id}
			control={f.control}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				return (
					<div>
						{label && <Label label={label} />}
						<AntdInputNumber<number>
							value={value}
							onChange={onChange}
							placeholder={placeholder}
							disabled={isDisabled}
							style={{ width: '100%' }}
							{...(isPrice && {
								formatter: (value) => {
									return formatNumber(value || 0)
								},
								parser: (value) => {
									if (!value) return 0
									const cleanValue = value.replace(/[^\d.,-]/g, '')
									const normalizedValue = usesCommaDecimal
										? cleanValue.replace(',', '.')
										: cleanValue.replace(/,/g, '')
									return parseFloat(normalizedValue)
								},
							})}
						/>
						<Error error={error?.message} />
					</div>
				)
			}}
		/>
	)
}
