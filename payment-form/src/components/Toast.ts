import type { ToastOptions } from 'react-toastify'
import { Bounce, toast } from 'react-toastify'

export { ToastContainer } from 'react-toastify'

const SETTINGS = {
	autoClose: 5000,
	closeOnClick: true,
	draggable: true,
	hideProgressBar: false,
	pauseOnHover: true,
	position: 'top-right',
	progress: undefined,
	theme: 'light',
	transition: Bounce,
} as ToastOptions

export const toastSuccess = (s: string) => toast.success(s, SETTINGS)
export const toastInfo = (s: string) => toast.info(s, SETTINGS)
export const toastErr = (s: string) => toast.error(s, SETTINGS)
