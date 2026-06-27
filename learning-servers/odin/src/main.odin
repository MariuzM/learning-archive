package main

import "core:encoding/json"
import "core:fmt"
import "core:log"
import "core:mem"
import "core:net"
import "core:strings"

import http "../odin-http"

HOST :: "127.0.0.1"
PORT :: 8080

LINES_PER_PAGE :: 45
FONT_SIZE :: 11
LINE_STEP :: 16
TOP_Y :: 740

// Baked into the binary at compile time; per-request work is assembling the PDF.
// 240x160 baseline JPEG, embedded via /DCTDecode.
JPEG :: #load("../../assets/sample.jpg")

// The text to render, embedded and parsed once at startup. ~100 pages of lines.
CONTENT :: #load("../../assets/content.json")
Doc :: struct {
	lines: []string,
}
lines: []string

// One cover page (heading + JPEG) then the JSON text paginated 45 lines/page.
build_pdf :: proc(heading: string, allocator: mem.Allocator) -> []byte {
	ta := context.temp_allocator

	contents: [dynamic]string
	contents.allocator = ta
	{
		c := strings.builder_make(ta)
		strings.write_string(&c, "BT\n/F1 24 Tf\n72 720 Td\n(")
		strings.write_string(&c, heading)
		strings.write_string(&c, ") Tj\nET\nq\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n")
		append(&contents, string(c.buf[:]))
	}
	p := 0
	for p * LINES_PER_PAGE < len(lines) {
		stop := min((p + 1) * LINES_PER_PAGE, len(lines))
		c := strings.builder_make(ta)
		strings.write_string(&c, "BT\n/F1 ")
		strings.write_int(&c, FONT_SIZE)
		strings.write_string(&c, " Tf\n72 ")
		strings.write_int(&c, TOP_Y)
		strings.write_string(&c, " Td\n")
		for j in (p * LINES_PER_PAGE) ..< stop {
			if j == p * LINES_PER_PAGE {
				strings.write_string(&c, "(")
			} else {
				strings.write_string(&c, "0 -")
				strings.write_int(&c, LINE_STEP)
				strings.write_string(&c, " Td\n(")
			}
			strings.write_string(&c, lines[j])
			strings.write_string(&c, ") Tj\n")
		}
		strings.write_string(&c, "ET\n")
		append(&contents, string(c.buf[:]))
		p += 1
	}
	num_pages := len(contents)

	objects: [dynamic]string
	objects.allocator = ta
	append(&objects, "<< /Type /Catalog /Pages 2 0 R >>") // 1
	{
		o := strings.builder_make(ta)
		strings.write_string(&o, "<< /Type /Pages /Kids [")
		for k in 0 ..< num_pages {
			if k > 0 do strings.write_string(&o, " ")
			strings.write_int(&o, 5 + 2 * k)
			strings.write_string(&o, " 0 R")
		}
		strings.write_string(&o, "] /Count ")
		strings.write_int(&o, num_pages)
		strings.write_string(&o, " >>")
		append(&objects, string(o.buf[:])) // 2
	}
	append(&objects, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>") // 3
	{
		o := strings.builder_make(ta)
		strings.write_string(&o, "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ")
		strings.write_int(&o, len(JPEG))
		strings.write_string(&o, " >>\nstream\n")
		strings.write_bytes(&o, JPEG)
		strings.write_string(&o, "\nendstream")
		append(&objects, string(o.buf[:])) // 4
	}
	for k in 0 ..< num_pages {
		po := strings.builder_make(ta)
		strings.write_string(&po, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> /XObject << /Im1 4 0 R >> >> /Contents ")
		strings.write_int(&po, 6 + 2 * k)
		strings.write_string(&po, " 0 R >>")
		append(&objects, string(po.buf[:]))

		co := strings.builder_make(ta)
		strings.write_string(&co, "<< /Length ")
		strings.write_int(&co, len(contents[k]))
		strings.write_string(&co, " >>\nstream\n")
		strings.write_string(&co, contents[k])
		strings.write_string(&co, "endstream")
		append(&objects, string(co.buf[:]))
	}

	b := strings.builder_make(allocator)
	strings.write_string(&b, "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
	offsets: [dynamic]int
	offsets.allocator = ta
	for obj, i in objects {
		append(&offsets, len(b.buf))
		strings.write_int(&b, i + 1)
		strings.write_string(&b, " 0 obj\n")
		strings.write_string(&b, obj)
		strings.write_string(&b, "\nendobj\n")
	}
	xref_off := len(b.buf)
	n := len(objects)
	strings.write_string(&b, "xref\n0 ")
	strings.write_int(&b, n + 1)
	strings.write_string(&b, "\n0000000000 65535 f\r\n")
	for off in offsets {
		fmt.sbprintf(&b, "%010d 00000 n\r\n", off)
	}
	strings.write_string(&b, "trailer\n<< /Size ")
	strings.write_int(&b, n + 1)
	strings.write_string(&b, " /Root 1 0 R >>\nstartxref\n")
	strings.write_int(&b, xref_off)
	strings.write_string(&b, "\n%%EOF\n")

	return b.buf[:]
}

// Heavy, real-world incoming-request validation. Odin has no validation library,
// so core:encoding/json does the structural parse and the field constraints are
// checked by hand below.
Item :: struct {
	sku:   string,
	qty:   int,
	price: f64,
}
Payload :: struct {
	username: string,
	email:    string,
	age:      int,
	password: string,
	website:  string,
	country:  string,
	tags:     []string,
	items:    []Item,
}

COUNTRIES :: [?]string{"US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN"}

valid_username :: proc(s: string) -> bool {
	if len(s) < 3 || len(s) > 30 do return false
	for i in 0 ..< len(s) {
		ch := s[i]
		if !((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '_') do return false
	}
	return true
}

valid_email :: proc(s: string) -> bool {
	if len(s) == 0 || len(s) > 100 do return false
	if strings.index_byte(s, ' ') != -1 do return false
	at := strings.index_byte(s, '@')
	if at <= 0 do return false
	domain := s[at + 1:]
	if strings.index_byte(domain, '@') != -1 do return false
	dot := strings.index_byte(domain, '.')
	return dot > 0 && dot != len(domain) - 1
}

valid_password :: proc(s: string) -> bool {
	if len(s) < 8 || len(s) > 100 do return false
	lo, up, di := false, false, false
	for i in 0 ..< len(s) {
		ch := s[i]
		switch {
		case ch >= 'a' && ch <= 'z':
			lo = true
		case ch >= 'A' && ch <= 'Z':
			up = true
		case ch >= '0' && ch <= '9':
			di = true
		}
	}
	return lo && up && di
}

valid_sku :: proc(s: string) -> bool {
	if len(s) != 7 || s[3] != '-' do return false
	for i in 0 ..< 3 do if s[i] < 'A' || s[i] > 'Z' do return false
	for i in 4 ..< 7 do if s[i] < '0' || s[i] > '9' do return false
	return true
}

valid_country :: proc(s: string) -> bool {
	for c in COUNTRIES do if c == s do return true
	return false
}

validate_payload :: proc(p: Payload) -> bool {
	if !valid_username(p.username) do return false
	if !valid_email(p.email) do return false
	if p.age < 13 || p.age > 120 do return false
	if !valid_password(p.password) do return false
	if len(p.website) > 200 do return false
	if !strings.has_prefix(p.website, "http://") && !strings.has_prefix(p.website, "https://") do return false
	if !valid_country(p.country) do return false
	if len(p.tags) < 1 || len(p.tags) > 10 do return false
	for t in p.tags do if len(t) < 1 || len(t) > 20 do return false
	if len(p.items) < 1 || len(p.items) > 50 do return false
	for it in p.items {
		if !valid_sku(it.sku) do return false
		if it.qty < 1 || it.qty > 999 do return false
		if it.price < 0 || it.price > 100000 do return false
	}
	return true
}

respond_valid :: proc(res: ^http.Response, ok: bool) {
	res.status = .OK if ok else .Bad_Request
	http.headers_set_content_type(&res.headers, "application/json")
	http.body_set(res, "{\"valid\":true}" if ok else "{\"valid\":false}")
	http.respond(res)
}

validate :: proc(req: ^http.Request, res: ^http.Response) {
	http.body(req, 1 << 20, res, proc(user: rawptr, body: http.Body, err: http.Body_Error) {
		res := cast(^http.Response)user
		if err != nil {
			respond_valid(res, false)
			return
		}
		payload: Payload
		if json.unmarshal(transmute([]byte)body, &payload, allocator = context.temp_allocator) != nil {
			respond_valid(res, false)
			return
		}
		respond_valid(res, validate_payload(payload))
	})
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

	// Parse the embedded JSON once at startup; lines live for the process lifetime.
	doc: Doc
	if err := json.unmarshal(CONTENT, &doc); err != nil {
		fmt.panicf("parse content.json: %v", err)
	}
	lines = doc.lines

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
	http.route_post(&router, "/validate", http.handler(validate))

	routed := http.router_handler(&router)

	log.infof("listening on http://%s:%d", HOST, PORT)

	// odin-http runs one nbio event loop per core, each accepting independently,
	// so a slow handler never blocks the others and connection churn parallelizes.
	err := http.listen_and_serve(&s, routed, net.Endpoint{address = net.IP4_Loopback, port = PORT})
	fmt.assertf(err == nil, "server stopped with error: %v", err)
}
