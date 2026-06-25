<template>
	<nav class="flex gap-4">
		<RouterLink to="/" active-class="bg-slate-400">Home</RouterLink>
		<RouterLink to="/about" active-class="bg-slate-400">About</RouterLink>
		<RouterLink to="/contact-us" active-class="bg-slate-400">Contact Us</RouterLink>
	</nav>
	<slot />
</template>
