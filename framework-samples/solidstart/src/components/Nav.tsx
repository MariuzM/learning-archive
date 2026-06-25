import { useLocation } from '@solidjs/router'

const NAV = [
	{ label: 'Home', href: '/' },
	{ label: 'About', href: '/about' },
	{ label: 'Admin', href: '/admin' },
	{ label: 'Admin About', href: '/admin/about' },
]

export const Nav = () => {
	const nav = useLocation()
	const active = (p: string) => (p == nav.pathname ? 'bg-slate-400' : '')
	return (
		<nav class="bg-green-200">
			Nav Links:
			<div class="flex gap-4">
				<div class={active('/')}>
					<a href="/">Home</a>
				</div>
				<div class={active('/about')}>
					<a href="/about">About</a>
				</div>
				<div class={active('/admin')}>
					<a href="/admin">Admin</a>
				</div>
				<div class={active('/admin/about')}>
					<a href="/admin/about">Admin About</a>
				</div>
			</div>
		</nav>
	)
}
