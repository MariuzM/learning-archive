import std/[strutils, json]
import mummy

proc isCountry(s: string): bool =
  s in ["US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN"]

proc validUsername(s: string): bool =
  if s.len < 3 or s.len > 30: return false
  for ch in s:
    if not ((ch >= 'a' and ch <= 'z') or (ch >= '0' and ch <= '9') or ch == '_'): return false
  return true

proc validEmail(s: string): bool =
  if s.len == 0 or s.len > 100 or ' ' in s: return false
  let at = s.find('@')
  if at <= 0: return false
  let domain = s[at + 1 .. ^1]
  if '@' in domain: return false
  let dot = domain.find('.')
  return dot > 0 and dot != domain.len - 1

proc validPassword(s: string): bool =
  if s.len < 8 or s.len > 100: return false
  var lo, up, di = false
  for ch in s:
    if ch >= 'a' and ch <= 'z': lo = true
    elif ch >= 'A' and ch <= 'Z': up = true
    elif ch >= '0' and ch <= '9': di = true
  return lo and up and di

proc validSku(s: string): bool =
  if s.len != 7 or s[3] != '-': return false
  for i in 0 .. 2:
    if s[i] < 'A' or s[i] > 'Z': return false
  for i in 4 .. 6:
    if s[i] < '0' or s[i] > '9': return false
  return true

proc validatePayload(jsonBody: string): bool =
  var node: JsonNode
  try:
    node = parseJson(jsonBody)
  except CatchableError:
    return false
  if node.kind != JObject or node.len != 8: return false
  for k in ["username", "email", "age", "password", "website", "country", "tags", "items"]:
    if not node.hasKey(k): return false
  if node["username"].kind != JString or not validUsername(node["username"].getStr): return false
  if node["email"].kind != JString or not validEmail(node["email"].getStr): return false
  if node["age"].kind != JInt: return false
  let age = node["age"].getInt
  if age < 13 or age > 120: return false
  if node["password"].kind != JString or not validPassword(node["password"].getStr): return false
  if node["website"].kind != JString: return false
  let web = node["website"].getStr
  if web.len > 200 or not (web.startsWith("http://") or web.startsWith("https://")): return false
  if node["country"].kind != JString or not isCountry(node["country"].getStr): return false
  let tags = node["tags"]
  if tags.kind != JArray or tags.len < 1 or tags.len > 10: return false
  for t in tags:
    if t.kind != JString or t.getStr.len < 1 or t.getStr.len > 20: return false
  let items = node["items"]
  if items.kind != JArray or items.len < 1 or items.len > 50: return false
  for it in items:
    if it.kind != JObject or it.len != 3: return false
    if not (it.hasKey("sku") and it.hasKey("qty") and it.hasKey("price")): return false
    if it["sku"].kind != JString or not validSku(it["sku"].getStr): return false
    if it["qty"].kind != JInt: return false
    let q = it["qty"].getInt
    if q < 1 or q > 999: return false
    var price: float
    case it["price"].kind
    of JFloat: price = it["price"].getFloat
    of JInt: price = it["price"].getInt.float
    else: return false
    if price < 0 or price > 100000: return false
  return true

proc validate*(request: Request) =
  var headers: HttpHeaders
  headers["Content-Type"] = "application/json"
  if validatePayload(request.body):
    request.respond(200, headers, "{\"valid\":true}")
  else:
    request.respond(400, headers, "{\"valid\":false}")
