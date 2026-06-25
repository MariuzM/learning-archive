import './pivottable.css'

import TableRenderers from './TableRenderers'

type DataRecord = Record<string, string | number | boolean | null>

type PivotBaseProps = {
	data: DataRecord[]
	cols?: string[]
	rows?: string[]
	aggregatorName?: string
	derivedAttributes?: Record<string, (record: DataRecord) => string | number | boolean | null>
}

type PivotTableProps = PivotBaseProps & {
	rendererName?: string
	renderers?: Record<string, React.ComponentType<any>>
}

export const PivotTable = (props: PivotTableProps): React.ReactElement => {
	const { renderers = TableRenderers as any, rendererName = 'Table', ...restProps } = props
	const Renderer = renderers[rendererName in renderers ? rendererName : Object.keys(renderers)[0]]
	return <Renderer {...restProps} />
}
