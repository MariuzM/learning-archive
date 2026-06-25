import { Stack } from 'expo-router'
import { useEffect } from 'react'

export default function RootLayout() {
	console.log('rendering AppLayout')

	useEffect(() => {
		return () => {
			console.log('AppLayout unmount')
		}
	}, [])

	return (
		<Stack
			screenOptions={{
				animation: 'ios',
				headerStyle: {
					backgroundColor: 'blue',
				},
				contentStyle: {
					backgroundColor: 'orange',
				},
				headerTintColor: 'white',
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="page1" />
		</Stack>
	)
}
