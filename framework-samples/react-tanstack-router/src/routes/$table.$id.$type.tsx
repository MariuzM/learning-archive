import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$table/$id/$type')({
	loader: async ({ params }) => {
		console.log('🚀 ~ params:', params)
		return {
			table: params.table,
		}
	},
	component: Table,
})

function Table() {
	const { table } = Route.useLoaderData()
	return <div>Hello /{table}!</div>
}
