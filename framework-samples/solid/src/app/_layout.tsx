import { ParentComponent } from 'solid-js'
import { A } from '@solidjs/router'

const NAV = [
	{ label: 'Home', href: '/' },
	{ label: 'About', href: '/about' },
	{ label: 'Admin', href: '/admin' },
	{ label: 'Admin About', href: '/admin/about' },
]

export const HomeLayout: ParentComponent = (p) => {
	return (
		<div>
			<div class="flex gap-2">
				{NAV.map((route) => (
					<A activeClass="bg-red-200" href={route.href} end>
						{route.label}
					</A>
				))}
			</div>
			{p.children}
		</div>
	)
}
