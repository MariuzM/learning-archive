#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <zlib.h>

typedef struct {
	long s, e;
} Range;

typedef struct {
	uint32_t num;
	Range r;
} Obj;

typedef struct {
	Obj *items;
	long len, cap;
} ObjList;

typedef struct {
	const uint8_t *ptr;
	long len;
} Slice;

typedef struct {
	Slice *items;
	long len, cap;
} SliceList;

typedef struct {
	uint32_t *items;
	long len, cap;
} U32List;

typedef struct {
	uint8_t *items;
	long len, cap;
} ByteBuf;

static void *xrealloc(void *p, size_t n) {
	void *r = realloc(p, n);
	if (!r) {
		fprintf(stderr, "out of memory\n");
		exit(1);
	}
	return r;
}

static void obj_push(ObjList *l, uint32_t num, Range r) {
	if (l->len == l->cap) {
		l->cap = l->cap ? l->cap * 2 : 64;
		l->items = xrealloc(l->items, (size_t)l->cap * sizeof(Obj));
	}
	l->items[l->len++] = (Obj){num, r};
}

static bool obj_get(const ObjList *l, uint32_t num, Range *out) {
	for (long i = 0; i < l->len; i++) {
		if (l->items[i].num == num) {
			*out = l->items[i].r;
			return true;
		}
	}
	return false;
}

static void slice_push(SliceList *l, Slice s) {
	if (l->len == l->cap) {
		l->cap = l->cap ? l->cap * 2 : 16;
		l->items = xrealloc(l->items, (size_t)l->cap * sizeof(Slice));
	}
	l->items[l->len++] = s;
}

static void u32_push(U32List *l, uint32_t v) {
	if (l->len == l->cap) {
		l->cap = l->cap ? l->cap * 2 : 16;
		l->items = xrealloc(l->items, (size_t)l->cap * sizeof(uint32_t));
	}
	l->items[l->len++] = v;
}

static void buf_append(ByteBuf *b, const uint8_t *src, long n) {
	if (b->len + n > b->cap) {
		while (b->len + n > b->cap) {
			b->cap = b->cap ? b->cap * 2 : 4096;
		}
		b->items = xrealloc(b->items, (size_t)b->cap);
	}
	memcpy(b->items + b->len, src, (size_t)n);
	b->len += n;
}

static void buf_byte(ByteBuf *b, uint8_t v) {
	buf_append(b, &v, 1);
}

static bool is_ws(uint8_t b) {
	switch (b) {
	case 0x00:
	case 0x09:
	case 0x0A:
	case 0x0C:
	case 0x0D:
	case 0x20:
		return true;
	}
	return false;
}

static bool is_delim(uint8_t b) {
	switch (b) {
	case '(':
	case ')':
	case '<':
	case '>':
	case '[':
	case ']':
	case '{':
	case '}':
	case '/':
	case '%':
		return true;
	}
	return false;
}

static bool starts_with(const uint8_t *data, long len, long at, const char *pat) {
	long plen = (long)strlen(pat);
	if (at < 0 || at + plen > len) {
		return false;
	}
	for (long i = 0; i < plen; i++) {
		if (data[at + i] != (uint8_t)pat[i]) {
			return false;
		}
	}
	return true;
}

static long find(const uint8_t *hay, long len, const char *needle, long from) {
	long nlen = (long)strlen(needle);
	if (nlen == 0) {
		return -1;
	}
	long i = from < 0 ? 0 : from;
	for (; i + nlen <= len; i++) {
		if (starts_with(hay, len, i, needle)) {
			return i;
		}
	}
	return -1;
}

static long skip_ws(const uint8_t *d, long len, long i) {
	long j = i;
	while (j < len && is_ws(d[j])) {
		j++;
	}
	return j;
}

static bool parse_uint(const uint8_t *d, long len, long i, uint32_t *val, long *next) {
	long j = i;
	uint32_t v = 0;
	while (j < len && d[j] >= '0' && d[j] <= '9') {
		v = v * 10 + (uint32_t)(d[j] - '0');
		j++;
	}
	if (j == i) {
		return false;
	}
	*val = v;
	*next = j;
	return true;
}

static bool token_bounded(const uint8_t *d, long len, long end) {
	return end >= len || is_ws(d[end]) || is_delim(d[end]);
}

static bool read_name(const uint8_t *d, long len, long i, Slice *name, long *next) {
	if (i >= len || d[i] != '/') {
		return false;
	}
	long j = i + 1;
	while (j < len && !is_ws(d[j]) && !is_delim(d[j])) {
		j++;
	}
	name->ptr = d + i + 1;
	name->len = j - (i + 1);
	*next = j;
	return true;
}

static bool name_has_value(const uint8_t *d, long len, const char *key, const char *val) {
	long klen = (long)strlen(key), vlen = (long)strlen(val);
	long from = 0;
	for (;;) {
		long p = find(d, len, key, from);
		if (p < 0) {
			break;
		}
		long j = skip_ws(d, len, p + klen);
		if (starts_with(d, len, j, val) && token_bounded(d, len, j + vlen)) {
			return true;
		}
		from = p + klen;
	}
	return false;
}

static bool parse_ref(const uint8_t *d, long len, long i, uint32_t *num, long *next) {
	uint32_t n;
	long a;
	if (!parse_uint(d, len, i, &n, &a)) {
		return false;
	}
	long b = skip_ws(d, len, a);
	uint32_t gen;
	long c;
	if (!parse_uint(d, len, b, &gen, &c)) {
		return false;
	}
	long e = skip_ws(d, len, c);
	if (e < len && d[e] == 'R') {
		*num = n;
		*next = e + 1;
		return true;
	}
	return false;
}

static ObjList parse_objects(const uint8_t *d, long len) {
	ObjList objs = {0};
	long i = 0;
	while (i < len) {
		bool boundary = i == 0 || is_ws(d[i - 1]) || is_delim(d[i - 1]);
		if (boundary && d[i] >= '0' && d[i] <= '9') {
			uint32_t num;
			long a;
			if (parse_uint(d, len, i, &num, &a)) {
				long b = skip_ws(d, len, a);
				if (b > a) {
					uint32_t gen;
					long c;
					if (parse_uint(d, len, b, &gen, &c)) {
						long e = skip_ws(d, len, c);
						if (e > c && starts_with(d, len, e, "obj") && token_bounded(d, len, e + 3)) {
							long start = e + 3;
							long end = find(d, len, "endobj", start);
							if (end >= 0) {
								obj_push(&objs, num, (Range){start, end});
								i = end + 6;
								continue;
							}
						}
					}
				}
			}
		}
		i++;
	}
	return objs;
}

static bool stream_bytes(const uint8_t *d, Range r, Slice *out) {
	long kw = find(d, r.e, "stream", r.s);
	if (kw < 0) {
		return false;
	}
	long p = kw + 6;
	if (starts_with(d, r.e, p, "\r\n")) {
		p += 2;
	} else if (p < r.e && (d[p] == '\n' || d[p] == '\r')) {
		p += 1;
	}
	long end = find(d, r.e, "endstream", p);
	if (end < 0) {
		return false;
	}
	out->ptr = d + p;
	out->len = end - p;
	return true;
}

static bool inflate_zlib(Slice src, ByteBuf *out) {
	z_stream zs = {0};
	if (inflateInit(&zs) != Z_OK) {
		return false;
	}
	zs.next_in = (Bytef *)src.ptr;
	zs.avail_in = (uInt)src.len;

	uint8_t chunk[65536];
	int ret;
	do {
		zs.next_out = chunk;
		zs.avail_out = sizeof(chunk);
		ret = inflate(&zs, Z_NO_FLUSH);
		if (ret != Z_OK && ret != Z_STREAM_END && ret != Z_BUF_ERROR) {
			inflateEnd(&zs);
			return false;
		}
		long produced = (long)(sizeof(chunk) - zs.avail_out);
		if (produced > 0) {
			buf_append(out, chunk, produced);
		}
		if (ret == Z_BUF_ERROR && produced == 0) {
			break;
		}
	} while (ret != Z_STREAM_END);

	inflateEnd(&zs);
	return out->len > 0;
}

static int count_name_do(const uint8_t *content, long len, Slice name) {
	char pat[256];
	int plen = snprintf(pat, sizeof(pat), "/%.*s", (int)name.len, name.ptr);
	if (plen < 0 || plen >= (int)sizeof(pat)) {
		return 0;
	}
	int count = 0;
	long from = 0;
	for (;;) {
		long p = find(content, len, pat, from);
		if (p < 0) {
			break;
		}
		long after = p + plen;
		from = p + 1;
		if (after < len && is_ws(content[after])) {
			long j = skip_ws(content, len, after);
			if (starts_with(content, len, j, "Do") && token_bounded(content, len, j + 2)) {
				count++;
			}
		}
	}
	return count;
}

static SliceList image_names(const uint8_t *d, Range res, const ObjList *images) {
	SliceList names = {0};
	long xo = find(d, res.e, "/XObject", res.s);
	if (xo < 0) {
		return names;
	}
	long op = find(d, res.e, "<<", xo);
	if (op < 0) {
		return names;
	}
	long open = op + 2;
	long close = find(d, res.e, ">>", open);
	if (close < 0) {
		close = res.e;
	}
	const uint8_t *dict = d + open;
	long dlen = close - open;
	long i = 0;
	while (i < dlen) {
		if (dict[i] == '/') {
			Slice name;
			long next;
			if (read_name(dict, dlen, i, &name, &next)) {
				long k = skip_ws(dict, dlen, next);
				uint32_t num;
				long k2;
				Range tmp;
				if (parse_ref(dict, dlen, k, &num, &k2) && obj_get(images, num, &tmp)) {
					slice_push(&names, name);
				}
				i = next;
				continue;
			}
		}
		i++;
	}
	return names;
}

static U32List content_refs(const uint8_t *d, Range body) {
	U32List refs = {0};
	long cp = find(d, body.e, "/Contents", body.s);
	if (cp < 0) {
		return refs;
	}
	long c = skip_ws(d, body.e, cp + 9);
	if (c < body.e && d[c] == '[') {
		long close = find(d, body.e, "]", c);
		if (close < 0) {
			close = body.e;
		}
		long i = c + 1;
		while (i < close) {
			if (d[i] >= '0' && d[i] <= '9' && (is_ws(d[i - 1]) || d[i - 1] == '[')) {
				uint32_t num;
				long next;
				if (parse_ref(d, body.e, i, &num, &next)) {
					u32_push(&refs, num);
					i = next;
					continue;
				}
			}
			i++;
		}
	} else {
		uint32_t num;
		long next;
		if (parse_uint(d, body.e, c, &num, &next)) {
			u32_push(&refs, num);
		}
	}
	return refs;
}

int main(int argc, char **argv) {
	const char *path = "../assets/pdf.pdf";
	if (argc > 1) {
		path = argv[1];
	}

	FILE *f = fopen(path, "rb");
	if (!f) {
		fprintf(stderr, "failed to read %s\n", path);
		return 1;
	}
	fseek(f, 0, SEEK_END);
	long size = ftell(f);
	fseek(f, 0, SEEK_SET);
	uint8_t *data = xrealloc(NULL, (size_t)size);
	if (fread(data, 1, (size_t)size, f) != (size_t)size) {
		fprintf(stderr, "failed to read %s\n", path);
		fclose(f);
		return 1;
	}
	fclose(f);

	ObjList objs = parse_objects(data, size);

	ObjList images = {0};
	for (long i = 0; i < objs.len; i++) {
		Range r = objs.items[i].r;
		if (name_has_value(data + r.s, r.e - r.s, "/Subtype", "/Image")) {
			obj_push(&images, objs.items[i].num, r);
		}
	}

	int placements = 0;
	for (long oi = 0; oi < objs.len; oi++) {
		Range body = objs.items[oi].r;
		if (!name_has_value(data + body.s, body.e - body.s, "/Type", "/Page")) {
			continue;
		}

		Range res = body;
		long p = find(data, body.e, "/Resources", body.s);
		if (p >= 0) {
			long q = skip_ws(data, body.e, p + 10);
			uint32_t num;
			long next;
			if (!starts_with(data, body.e, q, "<<") && parse_ref(data, body.e, q, &num, &next)) {
				Range r;
				if (obj_get(&objs, num, &r)) {
					res = r;
				}
			}
		}

		SliceList names = image_names(data, res, &images);
		if (names.len == 0) {
			free(names.items);
			continue;
		}

		ByteBuf content = {0};
		U32List refs = content_refs(data, body);
		for (long ri = 0; ri < refs.len; ri++) {
			Range cb;
			if (!obj_get(&objs, refs.items[ri], &cb)) {
				continue;
			}
			Slice raw;
			if (!stream_bytes(data, cb, &raw)) {
				continue;
			}
			if (find(data + cb.s, cb.e - cb.s, "/FlateDecode", 0) >= 0) {
				ByteBuf out = {0};
				if (inflate_zlib(raw, &out)) {
					buf_append(&content, out.items, out.len);
					buf_byte(&content, '\n');
				}
				free(out.items);
			} else {
				buf_append(&content, raw.ptr, raw.len);
				buf_byte(&content, '\n');
			}
		}

		for (long ni = 0; ni < names.len; ni++) {
			placements += count_name_do(content.items, content.len, names.items[ni]);
		}

		free(content.items);
		free(refs.items);
		free(names.items);
	}

	printf("%s: %d image placements (%ld unique images)\n", path, placements, images.len);

	free(images.items);
	free(objs.items);
	free(data);
	return 0;
}
