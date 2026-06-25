import './styles/main.style.css'

import { render } from 'solid-js/web'
import { Route, Router } from '@solidjs/router'

import { NotFound } from './app/_404'
import { HomeLayout } from './app/_layout'
import { About } from './app/about'
import { AdminAbout } from './app/admin/about'
import { Admin } from './app/admin/admin'
import { Home } from './app/home'

render(
	() => (
		<Router root={HomeLayout}>
			<Route path="/" component={Home} />
			<Route path="/about" component={About} />
			<Route path="/admin" component={Admin} />
			<Route path="/admin/about" component={AdminAbout} />
			<Route path="*404" component={NotFound} />
		</Router>
	),
	document.getElementById('root')!,
)
