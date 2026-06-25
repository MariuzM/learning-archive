export default defineNuxtRouteMiddleware(async () => {
	console.log(1)
	await new Promise((resolve) => setTimeout(resolve, 1000))
	console.log(2)
})
