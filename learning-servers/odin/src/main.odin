package main

import "core:fmt"
import "core:log"

import http "../odin-http"

HOST :: "127.0.0.1"
PORT :: 8080

root :: proc(req: ^http.Request, res: ^http.Response) {
	http.respond_plain(res, "Hello from Odin!\n")
}

hello_get :: proc(req: ^http.Request, res: ^http.Response) {
	http.respond_plain(res, "GET hello from Odin!\n")
}

hello_post :: proc(req: ^http.Request, res: ^http.Response) {
	http.respond_plain(res, "POST hello from Odin!\n")
}

main :: proc() {
	context.logger = log.create_console_logger(.Info)

	pdf_init()

	app: App
	app_init(&app)
	defer app_destroy(&app)

	app_get(&app, "/", root)
	app_get(&app, "/hello", hello_get)
	app_post(&app, "/hello", hello_post)
	app_get(&app, "/pdf", pdf)
	app_post(&app, "/validate", validate)

	err := app_listen(&app)
	fmt.assertf(err == nil, "server stopped with error: %v", err)
}
