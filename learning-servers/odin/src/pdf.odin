package main

import "core:encoding/json"
import "core:fmt"
import "core:mem"
import "core:strings"

import http "../odin-http"

LINES_PER_PAGE :: 45
FONT_SIZE :: 11
LINE_STEP :: 16
TOP_Y :: 740

JPEG :: #load("../../assets/sample.jpg")

CONTENT :: #load("../../assets/content.json")
Doc :: struct {
	lines: []string,
}
lines: []string

pdf_init :: proc() {
	doc: Doc
	if err := json.unmarshal(CONTENT, &doc); err != nil {
		fmt.panicf("parse content.json: %v", err)
	}
	lines = doc.lines
}

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
	append(&objects, "<< /Type /Catalog /Pages 2 0 R >>")
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
		append(&objects, string(o.buf[:]))
	}
	append(&objects, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
	{
		o := strings.builder_make(ta)
		strings.write_string(&o, "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ")
		strings.write_int(&o, len(JPEG))
		strings.write_string(&o, " >>\nstream\n")
		strings.write_bytes(&o, JPEG)
		strings.write_string(&o, "\nendstream")
		append(&objects, string(o.buf[:]))
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

pdf :: proc(req: ^http.Request, res: ^http.Response) {
	doc := build_pdf("Hello from Odin! PDF benchmark.", context.allocator)
	defer delete(doc, context.allocator)
	http.headers_set_content_type(&res.headers, "application/pdf")
	http.body_set(res, doc)
	http.respond(res)
}
