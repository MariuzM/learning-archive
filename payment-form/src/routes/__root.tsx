import 'react-toastify/dist/ReactToastify.css'

import { ToastContainer } from 'react-toastify'
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
	component: Root,
})

function Root() {
	return (
		<>
			<div className="bg-gray-100">
				<Outlet />
			</div>
			<ToastContainer />
		</>
	)
}
