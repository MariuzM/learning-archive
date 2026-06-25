import { Link } from 'react-router'

import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'New React Router App' },
		{ name: 'description', content: 'Welcome to React Router!' },
	]
}

export default function Home() {
	return (
		<div className="flex items-center justify-center pt-16 pb-4">
			<h1>Home</h1>
			<Link to="/about">About</Link>
		</div>
	)
}
