import { PivotTable } from './plot/PivotTable'

const data = [
	{ name: 'John', age: 30, city: 'New York', occupation: 'Engineer' },
	{ name: 'Jane', age: 25, city: 'San Francisco', occupation: 'Designer' },
	{ name: 'Bob', age: 40, city: 'New York', occupation: 'Engineer' },
	{ name: 'Alice', age: 35, city: 'Chicago', occupation: 'Manager' },
	{ name: 'Tom', age: 28, city: 'San Francisco', occupation: 'Designer' },
	{ name: 'Mary', age: 45, city: 'Chicago', occupation: 'Manager' },
	{ name: 'Steve', age: 32, city: 'New York', occupation: 'Engineer' },
	{ name: 'Sarah', age: 27, city: 'San Francisco', occupation: 'Designer' },
	{ name: 'Mike', age: 38, city: 'Chicago', occupation: 'Manager' },
	{ name: 'Mike', age: 38, city: 'Chicago', occupation: 'Manager' },
	{ name: 'Lisa', age: 29, city: 'New York', occupation: 'Engineer' },
]

export default function App() {
	return (
		<div>
			<h1>Pivot Table Demo</h1>
			<PivotTable data={data} rows={['city', 'name']} cols={['occupation']} />
		</div>
	)
}
