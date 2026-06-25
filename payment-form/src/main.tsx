import './styles/main.style.css'

import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

export const router = createRouter({
	routeTree,
	defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
	createRoot(rootElement).render(<RouterProvider router={router} />)
}
