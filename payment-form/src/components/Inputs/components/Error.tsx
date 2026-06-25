import { Text } from '../../Text'

export const Error = ({ error }: { error?: string }) => {
	if (!error) return null
	return <Text type="danger">{error}</Text>
}
