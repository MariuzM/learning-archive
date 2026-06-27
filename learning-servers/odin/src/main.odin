package main

import "core:fmt"
import "core:log"
import "core:mem"
import "core:net"
import "core:strings"

import http "../odin-http"

HOST :: "127.0.0.1"
PORT :: 8080

// Baked into the binary at compile time; per-request work is assembling the PDF.
// 240x160 baseline JPEG, embedded via /DCTDecode.
JPEG :: #load("../../assets/sample.jpg")

build_pdf :: proc(text: string, allocator: mem.Allocator) -> []byte {
	content := strings.builder_make(context.temp_allocator)
	strings.write_string(&content, "BT\n/F1 24 Tf\n72 720 Td\n(")
	strings.write_string(&content, text)
	strings.write_string(&content, ") Tj\nET\nq\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n")
	cbytes := content.buf[:]

	b := strings.builder_make(allocator)
	strings.write_string(&b, "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")

	offsets: [6]int
	for i in 0 ..< 6 {
		offsets[i] = len(b.buf)
		strings.write_int(&b, i + 1)
		strings.write_string(&b, " 0 obj\n")
		switch i {
		case 0:
			strings.write_string(&b, "<< /Type /Catalog /Pages 2 0 R >>")
		case 1:
			strings.write_string(&b, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
		case 2:
			strings.write_string(&b, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents 6 0 R >>")
		case 3:
			strings.write_string(&b, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
		case 4:
			strings.write_string(&b, "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ")
			strings.write_int(&b, len(JPEG))
			strings.write_string(&b, " >>\nstream\n")
			strings.write_bytes(&b, JPEG)
			strings.write_string(&b, "\nendstream")
		case 5:
			strings.write_string(&b, "<< /Length ")
			strings.write_int(&b, len(cbytes))
			strings.write_string(&b, " >>\nstream\n")
			strings.write_bytes(&b, cbytes)
			strings.write_string(&b, "endstream")
		}
		strings.write_string(&b, "\nendobj\n")
	}

	xref_off := len(b.buf)
	strings.write_string(&b, "xref\n0 7\n0000000000 65535 f\r\n")
	for off in offsets {
		fmt.sbprintf(&b, "%010d 00000 n\r\n", off)
	}
	strings.write_string(&b, "trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n")
	strings.write_int(&b, xref_off)
	strings.write_string(&b, "\n%%EOF\n")

	return b.buf[:]
}

root :: proc(req: ^http.Request, res: ^http.Response) {
	http.respond_plain(res, "Hello from Odin!\n")
}

// Same /hello route, different verbs: register one handler per method.
hello_get :: proc(req: ^http.Request, res: ^http.Response) {
	http.respond_plain(res, "GET hello from Odin!\n")
}

hello_post :: proc(req: ^http.Request, res: ^http.Response) {
	http.respond_plain(res, "POST hello from Odin!\n")
}

pdf :: proc(req: ^http.Request, res: ^http.Response) {
	doc := build_pdf("Hello from Odin! PDF benchmark.", context.allocator)
	defer delete(doc, context.allocator)
	// body_set copies into the response buffer, so freeing doc after is safe.
	http.headers_set_content_type(&res.headers, "application/pdf")
	http.body_set(res, doc)
	http.respond(res)
}

main :: proc() {
	context.logger = log.create_console_logger(.Info)

	s: http.Server
	// Installs SIGINT/SIGTERM handlers; drains in-flight requests then returns.
	http.server_shutdown_on_interrupt(&s)

	router: http.Router
	http.router_init(&router)
	defer http.router_destroy(&router)

	http.route_get(&router, "/", http.handler(root))
	http.route_get(&router, "/hello", http.handler(hello_get))
	http.route_post(&router, "/hello", http.handler(hello_post))
	http.route_get(&router, "/pdf", http.handler(pdf))

	routed := http.router_handler(&router)

	log.infof("listening on http://%s:%d", HOST, PORT)

	// odin-http runs one nbio event loop per core, each accepting independently,
	// so a slow handler never blocks the others and connection churn parallelizes.
	err := http.listen_and_serve(&s, routed, net.Endpoint{address = net.IP4_Loopback, port = PORT})
	fmt.assertf(err == nil, "server stopped with error: %v", err)
}
