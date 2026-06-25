import { Button as AntButton, Spin } from 'antd'
import type { ButtonType } from 'antd/es/button'
import { useState } from 'react'

export const Button = ({
	title,
	onClick,
	isDisabled,
	type,
}: {
	title: string
	onClick: () => void
	isDisabled?: boolean
	type?: ButtonType
}) => {
	const [isLoading, setIsLoading] = useState(false)
	return (
		<AntButton
			onClick={async () => {
				setIsLoading(true)
				await onClick()
				setIsLoading(false)
			}}
			disabled={isDisabled || isLoading}
			type={type}
		>
			{isLoading ? <Spin /> : title}
		</AntButton>
	)
}
