// Odin port of src/main.zig — kept side by side for comparison. The Zig build
// (build.zig) does not use this file. Build it standalone with:
//   odin build src/main.odin -file -target:freestanding_wasm32 \
//     -no-entry-point -out:zig-out/bin/main.wasm
//
// Note: where the Zig version calls fnv1a() from fingerprint.c compiled into
// the module, Odin has no bundled C compiler, so the hash is implemented
// natively in Odin below.
package main

// JS functions imported from the "env" module — same import object as the Zig
// build. Odin is the driver: it calls out to the browser for each signal.
@(default_calling_convention = "contextless")
foreign _ {
	jsUserAgent :: proc(ptr: [^]u8, max: int) -> int ---
	jsGpu :: proc(ptr: [^]u8, max: int) -> int ---
	jsCores :: proc() -> i32 ---
	jsDeviceMemory :: proc() -> f64 ---
	jsMaxTouchPoints :: proc() -> i32 ---
	jsScreenWidth :: proc() -> i32 ---
	jsScreenHeight :: proc() -> i32 ---
	jsDevicePixelRatio :: proc() -> f64 ---
	jsDeviceId :: proc(ptr: [^]u8, max: int) -> int ---
}

ua_buffer: [1024]u8
gpu_buffer: [256]u8
id_buffer: [64]u8
greeting_buffer: [256]u8
device_buffer: [1024]u8

@(export)
add :: proc "contextless" (a, b: i32) -> i32 {
	return a + b
}

@(export)
fibonacci :: proc "contextless" (n: u32) -> u64 {
	a, b: u64 = 0, 1
	for _ in 0 ..< n {
		a, b = b, a + b
	}
	return a
}

@(export)
greetingPtr :: proc "contextless" () -> [^]u8 {
	return raw_data(greeting_buffer[:])
}

@(export)
greet :: proc "contextless" (value: i32) -> int {
	i := append_str(greeting_buffer[:], "Hello from Odin + WebAssembly! Your number doubled is ")
	i += append_int(greeting_buffer[i:], int(value) * 2)
	return i
}

@(export)
devicePtr :: proc "contextless" () -> [^]u8 {
	return raw_data(device_buffer[:])
}

@(export)
detectDevice :: proc "contextless" () -> int {
	id := id_buffer[:jsDeviceId(raw_data(id_buffer[:]), len(id_buffer))]
	ua := ua_buffer[:jsUserAgent(raw_data(ua_buffer[:]), len(ua_buffer))]
	gpu := gpu_buffer[:jsGpu(raw_data(gpu_buffer[:]), len(gpu_buffer))]

	cores := jsCores()
	memory_gb := jsDeviceMemory()
	touch := jsMaxTouchPoints()
	screen_w := jsScreenWidth()
	screen_h := jsScreenHeight()
	dpr := jsDevicePixelRatio()

	i := 0
	i += append_str(device_buffer[i:], "Device ID: ")
	i += append_bytes(device_buffer[i:], id)
	i += append_str(device_buffer[i:], "\nDevice: ")
	i += append_str(device_buffer[i:], classify_device(ua))
	i += append_str(device_buffer[i:], "\nForm factor: ")
	i += append_str(device_buffer[i:], form_factor(ua, touch, screen_w, screen_h))

	i += append_str(device_buffer[i:], "\nCPU cores: ")
	if cores > 0 {
		i += append_int(device_buffer[i:], int(cores))
	} else {
		i += append_str(device_buffer[i:], "unknown")
	}

	i += append_str(device_buffer[i:], "\nMemory: ")
	if memory_gb > 0 {
		i += append_str(device_buffer[i:], "~")
		i += append_int(device_buffer[i:], int(memory_gb + 0.5))
		i += append_str(device_buffer[i:], " GB")
	} else {
		i += append_str(device_buffer[i:], "unknown")
	}

	i += append_str(device_buffer[i:], "\nTouch points: ")
	i += append_int(device_buffer[i:], int(touch))

	if screen_w > 0 && screen_h > 0 {
		i += append_str(device_buffer[i:], "\nScreen: ")
		i += append_int(device_buffer[i:], int(screen_w))
		i += append_str(device_buffer[i:], " x ")
		i += append_int(device_buffer[i:], int(screen_h))
		i += append_str(device_buffer[i:], " @ ")
		i += append_dpr(device_buffer[i:], dpr)
		i += append_str(device_buffer[i:], "x")
	}

	if len(gpu) > 0 {
		i += append_str(device_buffer[i:], "\nGPU: ")
		i += append_bytes(device_buffer[i:], gpu)
	}

	i += append_str(device_buffer[i:], "\nFingerprint: ")
	i += append_hex8(device_buffer[i:], fnv1a(ua))
	i += append_str(device_buffer[i:], "\n")
	return i
}

// FNV-1a, implemented natively in Odin (the Zig build links this from C).
fnv1a :: proc "contextless" (data: []u8) -> u32 {
	hash: u32 = 2166136261
	for c in data {
		hash ~= u32(c)
		hash *= 16777619
	}
	return hash
}

classify_device :: proc "contextless" (ua: []u8) -> string {
	switch {
	case contains(ua, "iPhone"):
		return "iPhone (iOS)"
	case contains(ua, "iPad"):
		return "iPad (iPadOS)"
	case contains(ua, "Android") && contains(ua, "Mobile"):
		return "Android phone"
	case contains(ua, "Android"):
		return "Android tablet"
	case contains(ua, "Windows"):
		return "Windows PC"
	case contains(ua, "Macintosh") || contains(ua, "Mac OS"):
		return "Mac"
	case contains(ua, "CrOS"):
		return "Chromebook"
	case contains(ua, "Linux"):
		return "Linux desktop"
	case:
		return "Unknown device"
	}
}

form_factor :: proc "contextless" (ua: []u8, touch, w, h: i32) -> string {
	min_dim := w if w < h else h
	switch {
	case contains(ua, "iPad"):
		return "Tablet"
	case contains(ua, "Android") && touch > 0 && min_dim >= 600:
		return "Tablet"
	case touch > 0 && min_dim > 0 && min_dim < 600:
		return "Phone"
	case contains(ua, "Mobile"):
		return "Phone"
	case touch > 0:
		return "Touch device"
	case:
		return "Desktop / laptop"
	}
}

contains :: proc "contextless" (haystack: []u8, needle: string) -> bool {
	if len(needle) == 0 {
		return true
	}
	if len(needle) > len(haystack) {
		return false
	}
	for i in 0 ..= len(haystack) - len(needle) {
		j := 0
		for j < len(needle) {
			if to_lower(haystack[i + j]) != to_lower(needle[j]) {
				break
			}
			j += 1
		}
		if j == len(needle) {
			return true
		}
	}
	return false
}

to_lower :: proc "contextless" (c: u8) -> u8 {
	return c + 32 if c >= 'A' && c <= 'Z' else c
}

append_bytes :: proc "contextless" (buf: []u8, s: []u8) -> int {
	n := min(len(s), len(buf))
	for k in 0 ..< n {
		buf[k] = s[k]
	}
	return n
}

append_str :: proc "contextless" (buf: []u8, s: string) -> int {
	n := min(len(s), len(buf))
	for k in 0 ..< n {
		buf[k] = s[k]
	}
	return n
}

append_int :: proc "contextless" (buf: []u8, value: int) -> int {
	if value == 0 {
		if len(buf) > 0 {
			buf[0] = '0'
			return 1
		}
		return 0
	}
	neg := value < 0
	n := -value if neg else value
	tmp: [20]u8
	l := 0
	for n > 0 {
		tmp[l] = u8('0' + (n % 10))
		n /= 10
		l += 1
	}
	w := 0
	if neg && len(buf) > 0 {
		buf[0] = '-'
		w = 1
	}
	for j := l; j > 0; {
		j -= 1
		if w >= len(buf) {
			break
		}
		buf[w] = tmp[j]
		w += 1
	}
	return w
}

append_dpr :: proc "contextless" (buf: []u8, value: f64) -> int {
	scaled := int(value * 10 + 0.5)
	n := append_int(buf, scaled / 10)
	n += append_str(buf[n:], ".")
	n += append_int(buf[n:], scaled % 10)
	return n
}

append_hex8 :: proc "contextless" (buf: []u8, value: u32) -> int {
	digits := "0123456789abcdef"
	n := min(8, len(buf))
	for k in 0 ..< n {
		shift := uint((7 - k) * 4)
		buf[k] = digits[int((value >> shift) & 0xf)]
	}
	return n
}
