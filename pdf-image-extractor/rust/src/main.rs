use std::collections::HashMap;
use std::env;
use std::fs;
use std::os::raw::{c_int, c_ulong};
use std::process;

#[link(name = "z")]
extern "C" {
    fn uncompress(dest: *mut u8, dest_len: *mut c_ulong, source: *const u8, source_len: c_ulong) -> c_int;
}

fn is_ws(b: u8) -> bool {
    matches!(b, 0x00 | 0x09 | 0x0A | 0x0C | 0x0D | 0x20)
}

fn is_delim(b: u8) -> bool {
    matches!(
        b,
        b'(' | b')' | b'<' | b'>' | b'[' | b']' | b'{' | b'}' | b'/' | b'%'
    )
}

fn find(hay: &[u8], needle: &[u8], from: usize) -> Option<usize> {
    if needle.is_empty() || from >= hay.len() {
        return None;
    }
    let first = needle[0];
    let mut i = from;
    while i + needle.len() <= hay.len() {
        if hay[i] == first && &hay[i..i + needle.len()] == needle {
            return Some(i);
        }
        i += 1;
    }
    None
}

fn skip_ws(d: &[u8], mut i: usize) -> usize {
    while i < d.len() && is_ws(d[i]) {
        i += 1;
    }
    i
}

fn parse_uint(d: &[u8], i: usize) -> Option<(u32, usize)> {
    let mut j = i;
    let mut v: u32 = 0;
    while j < d.len() && d[j].is_ascii_digit() {
        v = v * 10 + (d[j] - b'0') as u32;
        j += 1;
    }
    if j == i {
        None
    } else {
        Some((v, j))
    }
}

fn token_bounded(d: &[u8], end: usize) -> bool {
    end >= d.len() || is_ws(d[end]) || is_delim(d[end])
}

fn name_has_value(d: &[u8], key: &[u8], val: &[u8]) -> bool {
    let mut from = 0;
    while let Some(p) = find(d, key, from) {
        let j = skip_ws(d, p + key.len());
        if d[j..].starts_with(val) && token_bounded(d, j + val.len()) {
            return true;
        }
        from = p + key.len();
    }
    false
}

fn parse_ref(d: &[u8], i: usize) -> Option<(u32, usize)> {
    let (num, a) = parse_uint(d, i)?;
    let b = skip_ws(d, a);
    let (_g, c) = parse_uint(d, b)?;
    let e = skip_ws(d, c);
    if e < d.len() && d[e] == b'R' {
        Some((num, e + 1))
    } else {
        None
    }
}

fn parse_objects(d: &[u8]) -> HashMap<u32, (usize, usize)> {
    let mut objs = HashMap::new();
    let mut i = 0;
    while i < d.len() {
        if d[i].is_ascii_digit() && (i == 0 || is_ws(d[i - 1]) || is_delim(d[i - 1])) {
            if let Some((num, a)) = parse_uint(d, i) {
                let b = skip_ws(d, a);
                if b > a {
                    if let Some((_gen, c)) = parse_uint(d, b) {
                        let e = skip_ws(d, c);
                        if e > c && d[e..].starts_with(b"obj") && token_bounded(d, e + 3) {
                            let start = e + 3;
                            if let Some(end) = find(d, b"endobj", start) {
                                objs.insert(num, (start, end));
                                i = end + 6;
                                continue;
                            }
                        }
                    }
                }
            }
        }
        i += 1;
    }
    objs
}

fn stream_bytes<'a>(d: &'a [u8], body: (usize, usize)) -> Option<&'a [u8]> {
    let (s, e) = body;
    let kw = find(&d[..e], b"stream", s)?;
    let mut p = kw + 6;
    if d[p..].starts_with(b"\r\n") {
        p += 2;
    } else if p < d.len() && (d[p] == b'\n' || d[p] == b'\r') {
        p += 1;
    }
    let end = find(&d[..e], b"endstream", p)?;
    Some(&d[p..end])
}

fn inflate_zlib(src: &[u8]) -> Option<Vec<u8>> {
    let mut cap = (src.len() * 8).max(65536);
    loop {
        let mut dst = vec![0u8; cap];
        let mut dlen = cap as c_ulong;
        let r = unsafe {
            uncompress(dst.as_mut_ptr(), &mut dlen, src.as_ptr(), src.len() as c_ulong)
        };
        match r {
            0 => {
                dst.truncate(dlen as usize);
                return Some(dst);
            }
            -5 => {
                cap *= 2;
                if cap > (256 << 20) {
                    return None;
                }
            }
            _ => return None,
        }
    }
}

fn read_name<'a>(d: &'a [u8], i: usize) -> Option<(&'a [u8], usize)> {
    if i >= d.len() || d[i] != b'/' {
        return None;
    }
    let mut j = i + 1;
    while j < d.len() && !is_ws(d[j]) && !is_delim(d[j]) {
        j += 1;
    }
    Some((&d[i + 1..j], j))
}

fn image_names(d: &[u8], res: (usize, usize), images: &HashMap<u32, (usize, usize)>) -> Vec<Vec<u8>> {
    let (rs, re) = res;
    let mut names = Vec::new();
    let xo = match find(&d[..re], b"/XObject", rs) {
        Some(p) => p,
        None => return names,
    };
    let open = match find(&d[..re], b"<<", xo) {
        Some(p) => p + 2,
        None => return names,
    };
    let close = find(&d[..re], b">>", open).unwrap_or(re);
    let dict = &d[open..close];
    let mut i = 0;
    while i < dict.len() {
        if dict[i] == b'/' {
            if let Some((name, j)) = read_name(dict, i) {
                let k = skip_ws(dict, j);
                if let Some((num, _)) = parse_ref(dict, k) {
                    if images.contains_key(&num) {
                        names.push(name.to_vec());
                    }
                }
                i = j;
                continue;
            }
        }
        i += 1;
    }
    names
}

fn content_refs(d: &[u8], body: (usize, usize)) -> Vec<u32> {
    let (s, e) = body;
    let mut refs = Vec::new();
    let c = match find(&d[..e], b"/Contents", s) {
        Some(p) => p + 9,
        None => return refs,
    };
    let c = skip_ws(d, c);
    if c < e && d[c] == b'[' {
        let close = find(&d[..e], b"]", c).unwrap_or(e);
        let mut i = c + 1;
        while i < close {
            if d[i].is_ascii_digit() && (is_ws(d[i - 1]) || d[i - 1] == b'[') {
                if let Some((num, next)) = parse_ref(d, i) {
                    refs.push(num);
                    i = next;
                    continue;
                }
            }
            i += 1;
        }
    } else if let Some((num, _)) = parse_uint(d, c) {
        refs.push(num);
    }
    refs
}

fn count_name_do(content: &[u8], name: &[u8]) -> usize {
    let mut pat = Vec::with_capacity(name.len() + 1);
    pat.push(b'/');
    pat.extend_from_slice(name);
    let mut count = 0;
    let mut from = 0;
    while let Some(p) = find(content, &pat, from) {
        let after = p + pat.len();
        from = p + 1;
        if after < content.len() && is_ws(content[after]) {
            let j = skip_ws(content, after);
            if content[j..].starts_with(b"Do") && token_bounded(content, j + 2) {
                count += 1;
            }
        }
    }
    count
}

fn main() {
    let path = env::args().nth(1).unwrap_or_else(|| "../assets/pdf.pdf".to_string());
    let data = match fs::read(&path) {
        Ok(d) => d,
        Err(e) => {
            eprintln!("failed to read {}: {}", path, e);
            process::exit(1);
        }
    };

    let objs = parse_objects(&data);
    let images: HashMap<u32, (usize, usize)> = objs
        .iter()
        .filter(|(_, &b)| name_has_value(&data[b.0..b.1], b"/Subtype", b"/Image"))
        .map(|(&n, &b)| (n, b))
        .collect();

    let mut placements = 0;
    for (_, &body) in &objs {
        if !name_has_value(&data[body.0..body.1], b"/Type", b"/Page") {
            continue;
        }
        let res = match find(&data[..body.1], b"/Resources", body.0) {
            Some(p) if !data[skip_ws(&data, p + 10)..].starts_with(b"<<") => {
                match parse_ref(&data, skip_ws(&data, p + 10)) {
                    Some((num, _)) => objs.get(&num).copied().unwrap_or(body),
                    None => body,
                }
            }
            _ => body,
        };

        let names = image_names(&data, res, &images);
        if names.is_empty() {
            continue;
        }

        let mut content = Vec::new();
        for r in content_refs(&data, body) {
            if let Some(&cb) = objs.get(&r) {
                if let Some(raw) = stream_bytes(&data, cb) {
                    let body_slice = &data[cb.0..cb.1];
                    let bytes = if find(body_slice, b"/FlateDecode", 0).is_some() {
                        inflate_zlib(raw)
                    } else {
                        Some(raw.to_vec())
                    };
                    if let Some(b) = bytes {
                        content.extend_from_slice(&b);
                        content.push(b'\n');
                    }
                }
            }
        }

        for name in &names {
            placements += count_name_do(&content, name);
        }
    }

    println!(
        "{}: {} image placements ({} unique images)",
        path,
        placements,
        images.len()
    );
}
