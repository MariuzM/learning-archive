package main

import "core:encoding/json"
import "core:strings"

import http "../odin-http"

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
