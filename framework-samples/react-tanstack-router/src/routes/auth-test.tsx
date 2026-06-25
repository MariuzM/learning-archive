import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { supabase } from '../providers/supabase.provider'

export const Route = createFileRoute('/auth-test')({
	component: RouteComponent,
})

function RouteComponent() {
	useEffect(() => {
		const main = async () => {
			await supabase.auth.signInWithPassword({
				email: import.meta.env.VITE_TEST_EMAIL,
				password: import.meta.env.VITE_TEST_PASSWORD,
			})
		}

		supabase.auth.onAuthStateChange((event, session) => {
			console.log(event, session)
		})

		main()
	}, [])
	return <div>Hello "/auth"!</div>
}
