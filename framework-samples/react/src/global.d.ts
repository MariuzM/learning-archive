// TypeScript declarations for Utilities.js
declare module './plot/Utilities' {
	export function sortAs(order: string[]): (a: string, b: string) => number
	export function getSort(
		sorters: Record<string, (a: string, b: string) => number>,
		attr: string,
	): (a: string, b: string) => number

	export class PivotData {
		static forEachRecord(
			data: unknown[],
			derivedAttributes: Record<string, (record: unknown) => unknown>,
			callback: (record: unknown) => void,
		): void
		static propTypes: Record<string, unknown>
		static defaultProps: Record<string, unknown>
	}
}
