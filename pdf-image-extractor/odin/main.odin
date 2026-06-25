package main

import "core:bytes"
import "core:compress/zlib"
import "core:fmt"
import "core:os"

Range :: struct {
	s, e: int,
}

is_ws :: proc(b: u8) -> bool {
	switch b {
	case 0x00, 0x09, 0x0A, 0x0C, 0x0D, 0x20:
		return true
	}
	return false
}

is_delim :: proc(b: u8) -> bool {
	switch b {
	case '(', ')', '<', '>', '[', ']', '{', '}', '/', '%':
		return true
	}
	return false
}

starts_with :: proc(data: []u8, at: int, pat: string) -> bool {
	if at < 0 || at + len(pat) > len(data) {
		return false
	}
	for i in 0 ..< len(pat) {
		if data[at + i] != pat[i] {
			return false
		}
	}
	return true
}

find :: proc(hay: []u8, needle: string, from: int) -> int {
	if len(needle) == 0 {
		return -1
	}
	i := from
	for i + len(needle) <= len(hay) {
		if starts_with(hay, i, needle) {
			return i
		}
		i += 1
	}
	return -1
}

skip_ws :: proc(d: []u8, i: int) -> int {
	j := i
	for j < len(d) && is_ws(d[j]) {
		j += 1
	}
	return j
}

parse_uint :: proc(d: []u8, i: int) -> (val: u32, next: int, ok: bool) {
	j := i
	v: u32 = 0
	for j < len(d) && d[j] >= '0' && d[j] <= '9' {
		v = v * 10 + u32(d[j] - '0')
		j += 1
	}
	if j == i {
		return 0, i, false
	}
	return v, j, true
}

token_bounded :: proc(d: []u8, end: int) -> bool {
	return end >= len(d) || is_ws(d[end]) || is_delim(d[end])
}

read_name :: proc(d: []u8, i: int) -> (name: string, next: int, ok: bool) {
	if i >= len(d) || d[i] != '/' {
		return "", i, false
	}
	j := i + 1
	for j < len(d) && !is_ws(d[j]) && !is_delim(d[j]) {
		j += 1
	}
	return string(d[i + 1:j]), j, true
}

name_has_value :: proc(d: []u8, key: string, val: string) -> bool {
	from := 0
	for {
		p := find(d, key, from)
		if p < 0 {
			break
		}
		j := skip_ws(d, p + len(key))
		if starts_with(d, j, val) && token_bounded(d, j + len(val)) {
			return true
		}
		from = p + len(key)
	}
	return false
}

parse_ref :: proc(d: []u8, i: int) -> (num: u32, next: int, ok: bool) {
	n, a, ok1 := parse_uint(d, i)
	if !ok1 {
		return 0, i, false
	}
	b := skip_ws(d, a)
	_, c, ok2 := parse_uint(d, b)
	if !ok2 {
		return 0, i, false
	}
	e := skip_ws(d, c)
	if e < len(d) && d[e] == 'R' {
		return n, e + 1, true
	}
	return 0, i, false
}

parse_objects :: proc(d: []u8) -> map[u32]Range {
	objs := make(map[u32]Range)
	i := 0
	for i < len(d) {
		boundary := i == 0 || is_ws(d[i - 1]) || is_delim(d[i - 1])
		if boundary && d[i] >= '0' && d[i] <= '9' {
			num, a, ok := parse_uint(d, i)
			if ok {
				b := skip_ws(d, a)
				if b > a {
					_, c, ok2 := parse_uint(d, b)
					if ok2 {
						e := skip_ws(d, c)
						if e > c && starts_with(d, e, "obj") && token_bounded(d, e + 3) {
							start := e + 3
							end := find(d, "endobj", start)
							if end >= 0 {
								objs[num] = Range{start, end}
								i = end + 6
								continue
							}
						}
					}
				}
			}
		}
		i += 1
	}
	return objs
}

stream_bytes :: proc(d: []u8, r: Range) -> (out: []u8, ok: bool) {
	kw := find(d[:r.e], "stream", r.s)
	if kw < 0 {
		return nil, false
	}
	p := kw + 6
	if starts_with(d, p, "\r\n") {
		p += 2
	} else if p < len(d) && (d[p] == '\n' || d[p] == '\r') {
		p += 1
	}
	end := find(d[:r.e], "endstream", p)
	if end < 0 {
		return nil, false
	}
	return d[p:end], true
}

inflate_zlib :: proc(src: []u8) -> (out: []u8, ok: bool) {
	buf: bytes.Buffer
	err := zlib.inflate(src, &buf)
	if err != nil {
		bytes.buffer_destroy(&buf)
		return nil, false
	}
	return bytes.buffer_to_bytes(&buf), true
}

count_name_do :: proc(content: []u8, name: string) -> int {
	pat := fmt.tprintf("/%s", name)
	count := 0
	from := 0
	for {
		p := find(content, pat, from)
		if p < 0 {
			break
		}
		after := p + len(pat)
		from = p + 1
		if after < len(content) && is_ws(content[after]) {
			j := skip_ws(content, after)
			if starts_with(content, j, "Do") && token_bounded(content, j + 2) {
				count += 1
			}
		}
	}
	return count
}

image_names :: proc(d: []u8, res: Range, images: map[u32]Range) -> [dynamic]string {
	names: [dynamic]string
	xo := find(d[:res.e], "/XObject", res.s)
	if xo < 0 {
		return names
	}
	op := find(d[:res.e], "<<", xo)
	if op < 0 {
		return names
	}
	open := op + 2
	close := find(d[:res.e], ">>", open)
	if close < 0 {
		close = res.e
	}
	dict := d[open:close]
	i := 0
	for i < len(dict) {
		if dict[i] == '/' {
			name, next, ok := read_name(dict, i)
			if ok {
				k := skip_ws(dict, next)
				num, _, ok1 := parse_ref(dict, k)
				if ok1 && num in images {
					append(&names, name)
				}
				i = next
				continue
			}
		}
		i += 1
	}
	return names
}

content_refs :: proc(d: []u8, body: Range) -> [dynamic]u32 {
	refs: [dynamic]u32
	cp := find(d[:body.e], "/Contents", body.s)
	if cp < 0 {
		return refs
	}
	c := skip_ws(d, cp + 9)
	if c < body.e && d[c] == '[' {
		close := find(d[:body.e], "]", c)
		if close < 0 {
			close = body.e
		}
		i := c + 1
		for i < close {
			if d[i] >= '0' && d[i] <= '9' && (is_ws(d[i - 1]) || d[i - 1] == '[') {
				num, next, ok := parse_ref(d, i)
				if ok {
					append(&refs, num)
					i = next
					continue
				}
			}
			i += 1
		}
	} else {
		num, _, ok := parse_uint(d, c)
		if ok {
			append(&refs, num)
		}
	}
	return refs
}

main :: proc() {
	path := "../assets/pdf.pdf"
	if len(os.args) > 1 {
		path = os.args[1]
	}

	data, err := os.read_entire_file_from_path(path, context.allocator)
	if err != nil {
		fmt.eprintfln("failed to read %s: %v", path, err)
		os.exit(1)
	}

	objs := parse_objects(data)

	images := make(map[u32]Range)
	for num, r in objs {
		if name_has_value(data[r.s:r.e], "/Subtype", "/Image") {
			images[num] = r
		}
	}

	placements := 0
	for _, body in objs {
		if !name_has_value(data[body.s:body.e], "/Type", "/Page") {
			continue
		}

		res := body
		p := find(data[:body.e], "/Resources", body.s)
		if p >= 0 {
			q := skip_ws(data, p + 10)
			if !starts_with(data, q, "<<") {
				num, _, ok := parse_ref(data, q)
				if ok {
					r, found := objs[num]
					if found {
						res = r
					}
				}
			}
		}

		names := image_names(data, res, images)
		if len(names) == 0 {
			continue
		}

		content: [dynamic]u8
		refs := content_refs(data, body)
		for r in refs {
			cb, found := objs[r]
			if !found {
				continue
			}
			raw, ok := stream_bytes(data, cb)
			if !ok {
				continue
			}
			body_slice := data[cb.s:cb.e]
			if find(body_slice, "/FlateDecode", 0) >= 0 {
				out, dok := inflate_zlib(raw)
				if dok {
					append(&content, ..out)
					append(&content, '\n')
				}
			} else {
				append(&content, ..raw)
				append(&content, '\n')
			}
		}

		for name in names {
			placements += count_name_do(content[:], name)
		}
	}

	fmt.printfln("%s: %d image placements (%d unique images)", path, placements, len(images))
}
