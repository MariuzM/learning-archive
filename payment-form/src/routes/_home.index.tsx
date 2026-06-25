import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'

import { API_GET_ValidateIban } from '../apis/validate.api'
import { Button } from '../components/Button'
import { useForm } from '../components/FormBuilder/formBuilder.hook'
import { InputNumber } from '../components/Inputs/InputNumber'
import type { OptionT } from '../components/Inputs/InputSelect'
import { InputSelect } from '../components/Inputs/InputSelect'
import { InputText } from '../components/Inputs/InputText'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { toastErr, toastSuccess } from '../components/Toast'
import { useDebounce } from '../hooks/useDebounce.hook'
import { formatNumber, t } from '../utils/i18n.util'
import { sleep } from '../utils/sleep.util'

export const Route = createFileRoute('/_home/')({
	component: Home,
})

const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/

const Schema = (maxAmount = 1000000) =>
	z.object({
		senderAccount: z.string().min(1, { message: t('senderAccount.required') }),
		senderAmount: z
			.number()
			.min(0.01, { message: t('senderAmount.min') })
			.max(maxAmount, { message: t('senderAmount.max').replace('${0}', maxAmount.toString()) }),
		senderPurpose: z
			.string()
			.min(3, { message: t('senderPurpose.min') })
			.max(135, { message: t('senderPurpose.max') }),

		receiverAccount: z
			.string()
			.min(1, { message: t('receiverAccount.required') })
			.regex(ibanRegex, { message: t('receiverAccount.invalid') }),
		receiverName: z
			.string()
			.min(1, { message: t('receiverName.required') })
			.max(70, { message: t('receiverName.max') }),
	})

type SchemaT = z.infer<ReturnType<typeof Schema>>

function Home() {
	const [payeeAccount, setPayeeAccount] = useState<OptionT | null>(null)
	const [maxAmount, setMaxAmount] = useState(1000000)
	const [isAmountDisabled, setIsAmountDisabled] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const form = useForm(Schema(maxAmount))
	const iban = form.watch('receiverAccount')
	const debouncedIban = useDebounce(iban, 700)

	const balance = payeeAccount?.meta?.balance ?? 0
	const senderAmount = form.watch('senderAmount') ?? 0
	const afterBalance = balance - senderAmount
	const isFormDisabled = isAmountDisabled || afterBalance < 0 || isLoading

	const validateIban = useCallback(
		async (iban: string) => {
			try {
				const res = await API_GET_ValidateIban(iban)
				if (!res.valid) form.setError('receiverAccount', { message: t('receiverAccount.invalid') })
				else form.clearErrors('receiverAccount')
			} catch (err) {
				console.error('IBAN validation failed', err)
			}
		},
		[form],
	)

	const onSubmit = async (data: SchemaT) => {
		setIsLoading(true)
		await sleep(4000)
		toastSuccess(t('transaction.success'))
		setIsLoading(false)
	}

	useEffect(() => {
		if (debouncedIban && debouncedIban.length > 10) validateIban(debouncedIban)
	}, [debouncedIban, validateIban])

	useEffect(() => {
		if (payeeAccount?.meta?.balance !== undefined) {
			if (balance < 0) {
				setIsAmountDisabled(true)
				setMaxAmount(0)
				toastErr(t('senderAmount.insufficient'))
				form.setError('senderAmount', { message: t('senderAmount.insufficient') })
			} else {
				form.clearErrors('senderAmount')
				setIsAmountDisabled(false)
				setMaxAmount(balance)
			}
		}
	}, [balance, form, payeeAccount?.meta?.balance])

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
			<div className="flex w-full max-w-lg flex-col space-y-4 rounded-2xl bg-white p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold text-gray-800">{t('title')}</h2>
					<LanguageSwitcher />
				</div>

				<InputSelect
					f={form}
					id="senderAccount"
					label={t('senderAccount.label')}
					placeholder={t('senderAccount.placeholder')}
					options={[
						{ value: '1', label: 'LT307300010172619160', meta: { balance: 1000.12 } },
						{ value: '2', label: 'LT307300010172619161', meta: { balance: 2.43 } },
						{ value: '3', label: 'LT307300010172619162', meta: { balance: -5.87 } },
					]}
					onSelect={(_, option) => setPayeeAccount(option)}
					isDisabled={isLoading}
				/>

				<div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm">
					<span className="text-gray-600">{t('currentBalance')}:</span>
					<span className={`font-semibold ${balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
						{formatNumber(balance)}
					</span>
				</div>

				<InputNumber
					f={form}
					id="senderAmount"
					label={t('senderAmount.label')}
					placeholder={t('senderAmount.placeholder')}
					isPrice
				/>

				<div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm">
					<span className="text-gray-600">{t('afterBalance')}:</span>
					<span className={`font-semibold ${afterBalance < 0 ? 'text-red-500' : 'text-green-600'}`}>
						{formatNumber(afterBalance)}
					</span>
				</div>

				<InputText
					f={form}
					id="senderPurpose"
					label={t('senderPurpose.label')}
					placeholder={t('senderPurpose.placeholder')}
					isDisabled={isFormDisabled}
				/>
				<InputText
					f={form}
					id="receiverAccount"
					label={t('receiverAccount.label')}
					placeholder={t('receiverAccount.placeholder')}
					isDisabled={isFormDisabled}
				/>
				<InputText
					f={form}
					id="receiverName"
					label={t('receiverName.label')}
					placeholder={t('receiverName.placeholder')}
					isDisabled={isFormDisabled}
				/>

				<Button
					title={t('buttons.submit')}
					onClick={() => form.handleSubmit(onSubmit)()}
					isDisabled={isFormDisabled}
					type="primary"
				/>
			</div>
		</div>
	)
}
