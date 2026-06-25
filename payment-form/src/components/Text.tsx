import { Typography } from 'antd'
import type { BaseType } from 'antd/es/typography/Base'

export const Text = ({
	className,
	children,
	type,
}: {
	className?: string
	children: React.ReactNode
	type?: BaseType
}) => {
	return <Typography.Text type={type}>{children}</Typography.Text>
}
