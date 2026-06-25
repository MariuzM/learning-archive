import type { MouseEventHandler } from 'react'
import React from 'react'

import { PivotData } from './Utilities'

// Types for component props and configuration
type DataRecord = Record<string, string | number | boolean | null>

type PivotDataProps = {
	data: DataRecord[]
	aggregatorName: string
	cols?: string[]
	rows?: string[]
	vals?: string[]
	valueFilter?: Record<string, Record<string, boolean>>
	sorters?: ((a: string, b: string) => number) | Record<string, (a: string, b: string) => number>
	derivedAttributes?: Record<string, (record: DataRecord) => any>
	rowOrder?: 'key_a_to_z' | 'value_a_to_z' | 'value_z_to_a'
	colOrder?: 'key_a_to_z' | 'value_a_to_z' | 'value_z_to_a'
	tableColorScaleGenerator?: (values: number[]) => (value: number) => React.CSSProperties
	tableOptions?: {
		clickCallback?: (
			e: React.MouseEvent,
			value: any,
			filters: Record<string, any>,
			pivotData: any,
		) => void
	}
}

type RendererOptions = {
	heatmapMode?: 'full' | 'row' | 'col'
}

// Helper function for setting row/col-span in pivotTableRenderer
const spanSize = (arr: any[][], i: number, j: number): number => {
	let x
	if (i !== 0) {
		let noDraw = true
		for (x = 0; x <= j; x++) {
			if (arr[i - 1][x] !== arr[i][x]) {
				noDraw = false
			}
		}
		if (noDraw) {
			return -1
		}
	}

	let len = 0
	while (i + len < arr.length) {
		let stop = false
		for (x = 0; x <= j; x++) {
			if (arr[i][x] !== arr[i + len][x]) {
				stop = true
			}
		}
		if (stop) {
			break
		}
		len++
	}
	return len
}

// Color scale generator for heatmap
const redColorScaleGenerator = (values: number[]) => {
	const min = Math.min(...values)
	const max = Math.max(...values)

	return (x: number): React.CSSProperties => {
		const nonRed = 255 - Math.round((255 * (x - min)) / (max - min))
		return { backgroundColor: `rgb(255,${nonRed},${nonRed})` }
	}
}

// Table renderer factory
const makeRenderer = (opts: RendererOptions = {}) => {
	const TableRenderer = (props: PivotDataProps): React.ReactElement => {
		const pivotData = new PivotData(props)
		const colAttrs = pivotData.props.cols || []
		const rowAttrs = pivotData.props.rows || []
		const rowKeys = pivotData.getRowKeys()
		const colKeys = pivotData.getColKeys()
		const grandTotalAggregator = pivotData.getAggregator([], [])

		// Default color functions
		let valueCellColors: (r: any[], c: any[], v: any) => React.CSSProperties = () => ({})
		let rowTotalColors: (v: any) => React.CSSProperties = () => ({})
		let colTotalColors: (v: any) => React.CSSProperties = () => ({})

		// Setup heatmap colors if required
		if (opts.heatmapMode) {
			const colorScaleGenerator = props.tableColorScaleGenerator || redColorScaleGenerator

			const rowTotalValues = colKeys.map((x) => pivotData.getAggregator([], x).value())
			rowTotalColors = colorScaleGenerator(rowTotalValues)

			const colTotalValues = rowKeys.map((x) => pivotData.getAggregator(x, []).value())
			colTotalColors = colorScaleGenerator(colTotalValues)

			if (opts.heatmapMode === 'full') {
				const allValues: number[] = []
				rowKeys.forEach((r) =>
					colKeys.forEach((c) => allValues.push(pivotData.getAggregator(r, c).value())),
				)
				const colorScale = colorScaleGenerator(allValues)
				valueCellColors = (_, __, v) => colorScale(v)
			} else if (opts.heatmapMode === 'row') {
				const rowColorScales: Record<string, (v: any) => React.CSSProperties> = {}
				rowKeys.forEach((r) => {
					const rowValues = colKeys.map((x) => pivotData.getAggregator(r, x).value())
					rowColorScales[r.join('\0')] = colorScaleGenerator(rowValues)
				})
				valueCellColors = (r, _, v) => rowColorScales[r.join('\0')](v)
			} else if (opts.heatmapMode === 'col') {
				const colColorScales: Record<string, (v: any) => React.CSSProperties> = {}
				colKeys.forEach((c) => {
					const colValues = rowKeys.map((x) => pivotData.getAggregator(x, c).value())
					colColorScales[c.join('\0')] = colorScaleGenerator(colValues)
				})
				valueCellColors = (_, c, v) => colColorScales[c.join('\0')](v)
			}
		}

		// Setup click handler if needed
		const getClickHandler = props.tableOptions?.clickCallback
			? (value: any, rowValues: any[], colValues: any[]): MouseEventHandler | undefined => {
					const filters: Record<string, any> = {}
					for (const i in colAttrs) {
						const attr = colAttrs[i]
						if (colValues[i] !== null) {
							filters[attr] = colValues[i]
						}
					}
					for (const i in rowAttrs) {
						const attr = rowAttrs[i]
						if (rowValues[i] !== null) {
							filters[attr] = rowValues[i]
						}
					}
					return (e) => props.tableOptions?.clickCallback?.(e, value, filters, pivotData)
				}
			: undefined

		return (
			<table className="pvtTable">
				<thead>
					{colAttrs.map((c, j) => (
						<tr key={`colAttr${j}`}>
							{j === 0 && rowAttrs.length !== 0 && (
								<th colSpan={rowAttrs.length} rowSpan={colAttrs.length} />
							)}
							<th className="pvtAxisLabel">{c}</th>
							{colKeys.map((colKey, i) => {
								const x = spanSize(colKeys, i, j)
								if (x === -1) {
									return null
								}
								return (
									<th
										className="pvtColLabel"
										key={`colKey${i}`}
										colSpan={x}
										rowSpan={j === colAttrs.length - 1 && rowAttrs.length !== 0 ? 2 : 1}
									>
										{colKey[j]}
									</th>
								)
							})}

							{j === 0 && (
								<th
									className="pvtTotalLabel"
									rowSpan={colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)}
								>
									Totals
								</th>
							)}
						</tr>
					))}

					{rowAttrs.length !== 0 && (
						<tr>
							{rowAttrs.map((r, i) => (
								<th className="pvtAxisLabel" key={`rowAttr${i}`}>
									{r}
								</th>
							))}
							<th className="pvtTotalLabel">{colAttrs.length === 0 ? 'Totals' : null}</th>
						</tr>
					)}
				</thead>

				<tbody>
					{rowKeys.map((rowKey, i) => {
						const totalAggregator = pivotData.getAggregator(rowKey, [])
						return (
							<tr key={`rowKeyRow${i}`}>
								{rowKey.map((txt, j) => {
									const x = spanSize(rowKeys, i, j)
									if (x === -1) {
										return null
									}
									return (
										<th
											key={`rowKeyLabel${i}-${j}`}
											className="pvtRowLabel"
											rowSpan={x}
											colSpan={j === rowAttrs.length - 1 && colAttrs.length !== 0 ? 2 : 1}
										>
											{txt}
										</th>
									)
								})}
								{colKeys.map((colKey, j) => {
									const aggregator = pivotData.getAggregator(rowKey, colKey)
									const value = aggregator.value()
									return (
										<td
											className="pvtVal"
											key={`pvtVal${i}-${j}`}
											onClick={getClickHandler && getClickHandler(value, rowKey, colKey)}
											style={valueCellColors(rowKey, colKey, value)}
										>
											{aggregator.format(value)}
										</td>
									)
								})}
								<td
									className="pvtTotal"
									onClick={
										getClickHandler && getClickHandler(totalAggregator.value(), rowKey, [null])
									}
									style={colTotalColors(totalAggregator.value())}
								>
									{totalAggregator.format(totalAggregator.value())}
								</td>
							</tr>
						)
					})}

					<tr>
						<th
							className="pvtTotalLabel"
							colSpan={rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)}
						>
							Totals
						</th>

						{colKeys.map((colKey, i) => {
							const totalAggregator = pivotData.getAggregator([], colKey)
							return (
								<td
									className="pvtTotal"
									key={`total${i}`}
									onClick={
										getClickHandler && getClickHandler(totalAggregator.value(), [null], colKey)
									}
									style={rowTotalColors(totalAggregator.value())}
								>
									{totalAggregator.format(totalAggregator.value())}
								</td>
							)
						})}

						<td
							onClick={
								getClickHandler && getClickHandler(grandTotalAggregator.value(), [null], [null])
							}
							className="pvtGrandTotal"
						>
							{grandTotalAggregator.format(grandTotalAggregator.value())}
						</td>
					</tr>
				</tbody>
			</table>
		)
	}

	// Defaults for renderer
	TableRenderer.defaultTableColorScaleGenerator = redColorScaleGenerator

	return TableRenderer
}

// TSV Export Renderer
const TSVExportRenderer = (props: PivotDataProps): React.ReactElement => {
	const pivotData = new PivotData(props)
	const rowKeys = pivotData.getRowKeys()
	const colKeys = pivotData.getColKeys()

	// Ensure we have at least one row/column
	const normalizedRowKeys = rowKeys.length === 0 ? [[]] : rowKeys
	const normalizedColKeys = colKeys.length === 0 ? [[]] : colKeys

	// Create header row
	const headerRow: any[] = []

	// Add row headers
	if (pivotData.props.rows) {
		for (const row of pivotData.props.rows) {
			headerRow.push(row)
		}
	}

	// Add column data or aggregator name
	if (normalizedColKeys.length === 1 && normalizedColKeys[0].length === 0) {
		headerRow.push(props.aggregatorName)
	} else {
		for (const c of normalizedColKeys) {
			headerRow.push(c.join('-'))
		}
	}

	// Create data rows
	const result: any[][] = []

	// Build data rows
	for (const r of normalizedRowKeys) {
		const row: any[] = []

		// Add row headers
		for (const x of r) {
			row.push(x)
		}

		// Add values
		for (const c of normalizedColKeys) {
			const v = pivotData.getAggregator(r, c).value()
			row.push(v !== null && v !== undefined ? v : '')
		}

		result.push(row)
	}

	// Add header row at the beginning
	result.unshift(headerRow)

	return (
		<textarea
			value={result.map((r) => r.join('\t')).join('\n')}
			style={{ width: window.innerWidth / 2, height: window.innerHeight / 2 }}
			readOnly={true}
		/>
	)
}

// Export renderers with default configurations
export default {
	Table: makeRenderer(),
	'Table Heatmap': makeRenderer({ heatmapMode: 'full' }),
	'Table Col Heatmap': makeRenderer({ heatmapMode: 'col' }),
	'Table Row Heatmap': makeRenderer({ heatmapMode: 'row' }),
	'Exportable TSV': TSVExportRenderer,
}
