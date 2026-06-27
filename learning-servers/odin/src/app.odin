package main

import "core:log"
import "core:net"

import http "../odin-http"

App :: struct {
	server: http.Server,
	router: http.Router,
	host:   string,
	port:   int,
}

app_init :: proc(app: ^App, host := HOST, port := PORT) {
	app.host = host
	app.port = port
	http.router_init(&app.router)
	http.server_shutdown_on_interrupt(&app.server)
}

app_destroy :: proc(app: ^App) {
	http.router_destroy(&app.router)
}

app_get :: proc(app: ^App, path: string, handle: http.Handle_Proc) {
	http.route_get(&app.router, path, http.handler(handle))
}

app_post :: proc(app: ^App, path: string, handle: http.Handle_Proc) {
	http.route_post(&app.router, path, http.handler(handle))
}

app_put :: proc(app: ^App, path: string, handle: http.Handle_Proc) {
	http.route_put(&app.router, path, http.handler(handle))
}

app_patch :: proc(app: ^App, path: string, handle: http.Handle_Proc) {
	http.route_patch(&app.router, path, http.handler(handle))
}

app_delete :: proc(app: ^App, path: string, handle: http.Handle_Proc) {
	http.route_delete(&app.router, path, http.handler(handle))
}

app_listen :: proc(app: ^App) -> net.Network_Error {
	routed := http.router_handler(&app.router)
	log.infof("listening on http://%s:%d", app.host, app.port)
	return http.listen_and_serve(
		&app.server,
		routed,
		net.Endpoint{address = net.IP4_Loopback, port = app.port},
	)
}
