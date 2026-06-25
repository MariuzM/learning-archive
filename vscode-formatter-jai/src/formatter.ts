export type FormatOptions = {
  tabSize: number;
  insertSpaces: boolean;
  indentCaseContents: boolean;
  spaceAfterComma: boolean;
  maxBlankLines: number;
  insertFinalNewline: boolean;
  operatorSpacing: boolean;
  splitInlineCaseBodies: boolean;
  alignCaseBodies: boolean;
  alignDeclarations: boolean;
};

type Segment = { code: boolean; text: string };

type ScanResult = {
  blockComment: number;
  here: string | null;
  leadingClosers: number;
  delta: number;
  braceEvents: number[];
  segments: Segment[];
};

const isSpace = (ch: string) => ch === " " || ch === "\t";
const isCloser = (ch: string) => ch === ")" || ch === "]" || ch === "}";

const SPACE_OPS_3 = ["<<=", ">>="];
const SPACE_OPS_2 = [
  "::", ":=", "==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%=",
  "|=", "&=", "^=", "&&", "||", "->", "<<", ">>",
];

const KEYWORDS = new Set([
  "if", "else", "for", "while", "case", "return", "defer",
  "break", "continue", "using", "switch", "push_context",
]);

const scanLine = (line: string, blockCommentStart: number): ScanResult => {
  let blockComment = blockCommentStart;
  let here: string | null = null;
  let delta = 0;
  let leadingClosers = 0;
  let counting = blockCommentStart === 0;
  let started = false;
  const braceEvents: number[] = [];
  const segments: Segment[] = [];

  let buf: string[] = [];
  let bufCode = true;
  const flush = () => {
    if (buf.length > 0) {
      segments.push({ code: bufCode, text: buf.join("") });
      buf = [];
    }
  };
  const put = (s: string, code: boolean) => {
    if (buf.length > 0 && bufCode !== code) flush();
    bufCode = code;
    buf.push(s);
  };

  const len = line.length;
  let i = 0;

  while (i < len) {
    const c = line[i];
    const c2 = i + 1 < len ? line[i + 1] : "";

    if (blockComment > 0) {
      if (c === "*" && c2 === "/") {
        blockComment--;
        put("*/", false);
        i += 2;
        continue;
      }
      if (c === "/" && c2 === "*") {
        blockComment++;
        put("/*", false);
        i += 2;
        continue;
      }
      put(c, false);
      i++;
      continue;
    }

    if (isSpace(c)) {
      if (started) put(c, true);
      i++;
      continue;
    }

    if (c === "/" && c2 === "/") {
      started = true;
      put(line.slice(i), false);
      break;
    }

    if (c === "/" && c2 === "*") {
      blockComment++;
      counting = false;
      started = true;
      put("/*", false);
      i += 2;
      continue;
    }

    if (c === '"') {
      counting = false;
      started = true;
      const str = ['"'];
      let k = i + 1;
      while (k < len) {
        const ch = line[k];
        if (ch === "\\") {
          str.push(ch);
          if (k + 1 < len) str.push(line[k + 1]);
          k += 2;
          continue;
        }
        str.push(ch);
        k++;
        if (ch === '"') break;
      }
      put(str.join(""), false);
      i = k;
      continue;
    }

    if (c === "#") {
      const match = /^#string[ \t]+([A-Za-z_][A-Za-z0-9_]*)/.exec(line.slice(i));
      if (match) {
        here = match[1];
        counting = false;
        started = true;
        put(line.slice(i), false);
        break;
      }
      counting = false;
      started = true;
      put("#", true);
      i++;
      continue;
    }

    if (c === "{" || c === "(" || c === "[") {
      delta++;
      counting = false;
      started = true;
      if (c === "{") braceEvents.push(1);
      put(c, true);
      i++;
      continue;
    }

    if (c === "}" || c === ")" || c === "]") {
      delta--;
      if (counting) leadingClosers++;
      started = true;
      if (c === "}") braceEvents.push(-1);
      put(c, true);
      i++;
      continue;
    }

    counting = false;
    started = true;
    put(c, true);
    i++;
  }

  flush();
  return { blockComment, here, leadingClosers, delta, braceEvents, segments };
};

const normalizeCode = (code: string, options: FormatOptions, nextChar: string): string => {
  const o: string[] = [];
  const popSpace = () => {
    while (o.length > 0 && isSpace(o[o.length - 1])) o.pop();
  };
  const len = code.length;
  let i = 0;

  while (i < len) {
    const c = code[i];

    if (isSpace(c)) {
      o.push(c);
      i++;
      continue;
    }

    if (options.spaceAfterComma && (c === "," || c === ";")) {
      popSpace();
      o.push(c);
      i++;
      let j = i;
      while (j < len && isSpace(code[j])) j++;
      const nxt = j < len ? code[j] : nextChar;
      if (nxt && !isCloser(nxt)) o.push(" ");
      i = j;
      continue;
    }

    if (options.operatorSpacing) {
      const three = code.slice(i, i + 3);
      if (SPACE_OPS_3.includes(three)) {
        popSpace();
        o.push(" " + three + " ");
        i += 3;
        while (i < len && isSpace(code[i])) i++;
        continue;
      }
      const two = code.slice(i, i + 2);
      if (SPACE_OPS_2.includes(two)) {
        popSpace();
        o.push(" " + two + " ");
        i += 2;
        while (i < len && isSpace(code[i])) i++;
        continue;
      }
      if (c === "=" || c === "<" || c === ">") {
        popSpace();
        o.push(" " + c + " ");
        i++;
        while (i < len && isSpace(code[i])) i++;
        continue;
      }
      if (c === ":") {
        popSpace();
        o.push(":");
        i++;
        let j = i;
        while (j < len && isSpace(code[j])) j++;
        const nxt = j < len ? code[j] : nextChar;
        if (nxt && !isCloser(nxt)) o.push(" ");
        i = j;
        continue;
      }
    }

    o.push(c);
    i++;
  }

  return o.join("");
};

const joinSegments = (segments: Segment[], options: FormatOptions): string => {
  let res = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.code) {
      const next = i + 1 < segments.length ? segments[i + 1].text[0] || "" : "";
      res += normalizeCode(seg.text, options, next);
    } else {
      res += seg.text;
    }
  }
  return res;
};

const firstCodeSemicolon = (s: string): number => {
  const len = s.length;
  let i = 0;
  let block = 0;
  while (i < len) {
    const c = s[i];
    const c2 = i + 1 < len ? s[i + 1] : "";
    if (block > 0) {
      if (c === "*" && c2 === "/") { block--; i += 2; continue; }
      if (c === "/" && c2 === "*") { block++; i += 2; continue; }
      i++;
      continue;
    }
    if (c === "/" && c2 === "/") return -1;
    if (c === "/" && c2 === "*") { block++; i += 2; continue; }
    if (c === '"') {
      i++;
      while (i < len) {
        if (s[i] === "\\") { i += 2; continue; }
        if (s[i] === '"') { i++; break; }
        i++;
      }
      continue;
    }
    if (c === ";") return i;
    i++;
  }
  return -1;
};

const hasCode = (s: string): boolean => {
  const len = s.length;
  let i = 0;
  let block = 0;
  while (i < len) {
    const c = s[i];
    const c2 = i + 1 < len ? s[i + 1] : "";
    if (block > 0) {
      if (c === "*" && c2 === "/") { block--; i += 2; continue; }
      if (c === "/" && c2 === "*") { block++; i += 2; continue; }
      i++;
      continue;
    }
    if (c === "/" && c2 === "/") return false;
    if (c === "/" && c2 === "*") { block++; i += 2; continue; }
    if (c === '"') return true;
    if (!isSpace(c)) return true;
    i++;
  }
  return false;
};

type DeclInfo = { colon: number; eq: number; hasBlock: boolean };

const scanDecl = (text: string): DeclInfo => {
  const len = text.length;
  let i = 0;
  let block = 0;
  let bracket = 0;
  let colon = -1;
  let eq = -1;
  let hasBlock = false;
  while (i < len) {
    const c = text[i];
    const c2 = i + 1 < len ? text[i + 1] : "";
    if (block > 0) {
      if (c === "*" && c2 === "/") { block--; i += 2; continue; }
      if (c === "/" && c2 === "*") { block++; i += 2; continue; }
      i++;
      continue;
    }
    if (c === "/" && c2 === "/") break;
    if (c === "/" && c2 === "*") { block++; i += 2; continue; }
    if (c === '"') {
      i++;
      while (i < len) {
        if (text[i] === "\\") { i += 2; continue; }
        if (text[i] === '"') { i++; break; }
        i++;
      }
      continue;
    }
    if (c === "(" || c === "[") { bracket++; i++; continue; }
    if (c === ")" || c === "]") { bracket--; i++; continue; }
    if (c === "{" || c === "}") { hasBlock = true; i++; continue; }
    if (bracket === 0) {
      if (c === ":" && colon === -1) { colon = i; i++; continue; }
      if (c === "=" && colon !== -1 && eq === -1) {
        const prev = i > 0 ? text[i - 1] : "";
        const nx = c2;
        const compound = "=!<>:+-*/%&|^".includes(prev) || nx === "=";
        if (!compound) eq = i;
        i++;
        continue;
      }
    }
    i++;
  }
  return { colon, eq, hasBlock };
};

const startsWithKeyword = (text: string): boolean => {
  const m = /^[ \t]*([A-Za-z_][A-Za-z0-9_]*)/.exec(text);
  return m ? KEYWORDS.has(m[1]) : false;
};

const isDeclLine = (text: string): boolean => {
  const info = scanDecl(text);
  return info.colon >= 0 && !info.hasBlock && !startsWithKeyword(text);
};

type InlineCase = { labelLen: number; bodyIndent: string };
type Item = { text: string; protected: boolean; blank: boolean; depth: number; inlineCase?: InlineCase };

type Frame = { caseOpen: boolean };

const build = (text: string, options: FormatOptions): { eol: string; items: Item[] } => {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const tabSize = Math.max(1, options.tabSize || 4);
  const indentUnit = options.insertSpaces ? " ".repeat(tabSize) : "\t";
  const rawLines = text.split(/\r\n|\n/);
  const ind = (d: number) => indentUnit.repeat(Math.max(0, d));

  const items: Item[] = [];
  const stack: Frame[] = [];
  let depth = 0;
  let blockComment = 0;
  let here: string | null = null;

  const applyBraceEvents = (events: number[]) => {
    for (const ev of events) {
      if (ev > 0) stack.push({ caseOpen: false });
      else if (stack.length > 0) stack.pop();
    }
  };

  for (const line of rawLines) {
    const startedNormal = blockComment === 0 && here === null;

    if (here !== null) {
      items.push({ text: line, protected: true, blank: false, depth: 0 });
      if (line.trim() === here) here = null;
      continue;
    }

    const scan = scanLine(line, blockComment);
    blockComment = scan.blockComment;

    if (!startedNormal) {
      items.push({ text: line, protected: true, blank: false, depth: 0 });
      applyBraceEvents(scan.braceEvents);
      depth = Math.max(0, depth + scan.delta);
      here = scan.here;
      continue;
    }

    let normalized = joinSegments(scan.segments, options);
    normalized = normalized.replace(/^[ \t]+/, "").replace(/[ \t]+$/, "");

    if (normalized.length === 0) {
      items.push({ text: "", protected: false, blank: true, depth: 0 });
      applyBraceEvents(scan.braceEvents);
      depth = Math.max(0, depth + scan.delta);
      here = scan.here;
      continue;
    }

    const firstChar = normalized[0];
    const isCase = /^case\b/.test(normalized);

    let caseExtra = 0;
    if (options.indentCaseContents && stack.length > 0) {
      for (const frame of stack) {
        if (frame.caseOpen) caseExtra++;
      }
      const top = stack[stack.length - 1];
      if ((isCase || firstChar === "}") && top.caseOpen) caseExtra--;
    }

    const lineDepth = Math.max(0, depth - scan.leadingClosers + caseExtra);

    let inlineCase: InlineCase | undefined;
    if (isCase) {
      const semi = firstCodeSemicolon(normalized);
      if (semi >= 0 && hasCode(normalized.slice(semi + 1))) {
        inlineCase = {
          labelLen: ind(lineDepth).length + semi + 1,
          bodyIndent: ind(lineDepth + (options.indentCaseContents ? 1 : 0)),
        };
      }
    }
    items.push({ text: ind(lineDepth) + normalized, protected: false, blank: false, depth: lineDepth, inlineCase });

    applyBraceEvents(scan.braceEvents);
    depth = Math.max(0, depth + scan.delta);
    if (isCase && stack.length > 0) stack[stack.length - 1].caseOpen = true;
    here = scan.here;
  }

  return { eol, items };
};

const alignGroup = (items: Item[], group: number[]) => {
  const lines = group.map((g) => items[g].text);
  const infos = lines.map(scanDecl);

  const parts = lines.map((ln, k) => {
    const colon = infos[k].colon;
    const next = colon + 1 < ln.length ? ln[colon + 1] : "";
    const opLen = next === ":" || next === "=" ? 2 : 1;
    const op = ln.slice(colon, colon + opLen);
    const name = ln.slice(0, colon).replace(/[ \t]+$/, "");
    const rhs = ln.slice(colon + opLen).replace(/^[ \t]+/, "");
    const prefix = opLen === 1 ? name + ":" : name + " " + op;
    return { prefix, rhs };
  });

  let maxPrefix = 0;
  for (const p of parts) maxPrefix = Math.max(maxPrefix, p.prefix.length);
  const colonAligned = parts.map((p) =>
    p.rhs.length > 0 ? p.prefix.padEnd(maxPrefix) + " " + p.rhs : p.prefix,
  );

  const eqInfos = colonAligned.map(scanDecl);
  let maxBeforeEq = 0;
  for (let k = 0; k < colonAligned.length; k++) {
    if (eqInfos[k].eq >= 0) {
      const before = colonAligned[k].slice(0, eqInfos[k].eq).replace(/[ \t]+$/, "");
      maxBeforeEq = Math.max(maxBeforeEq, before.length);
    }
  }
  const eqAligned = colonAligned.map((ln, k) => {
    if (eqInfos[k].eq < 0) return ln;
    const before = ln.slice(0, eqInfos[k].eq).replace(/[ \t]+$/, "");
    const tail = ln.slice(eqInfos[k].eq);
    return before.padEnd(maxBeforeEq) + " " + tail;
  });

  for (let k = 0; k < group.length; k++) items[group[k]].text = eqAligned[k];
};

const handleInlineCases = (items: Item[], options: FormatOptions): Item[] => {
  const out: Item[] = [];
  let i = 0;
  while (i < items.length) {
    const it = items[i];
    if (!it.inlineCase) {
      out.push(it);
      i++;
      continue;
    }
    const run: Item[] = [];
    let j = i;
    while (j < items.length && items[j].inlineCase && items[j].depth === it.depth) {
      run.push(items[j]);
      j++;
    }

    if (run.length >= 2 && options.alignCaseBodies) {
      let maxLabel = 0;
      for (const r of run) maxLabel = Math.max(maxLabel, r.inlineCase!.labelLen);
      for (const r of run) {
        const label = r.text.slice(0, r.inlineCase!.labelLen);
        const body = r.text.slice(r.inlineCase!.labelLen).replace(/^[ \t]+/, "");
        out.push({ text: label.padEnd(maxLabel) + " " + body, protected: false, blank: false, depth: r.depth });
      }
    } else {
      for (const r of run) {
        if (options.splitInlineCaseBodies) {
          const label = r.text.slice(0, r.inlineCase!.labelLen);
          const body = r.text.slice(r.inlineCase!.labelLen).replace(/^[ \t]+/, "");
          out.push({ text: label, protected: false, blank: false, depth: r.depth });
          out.push({ text: r.inlineCase!.bodyIndent + body, protected: false, blank: false, depth: r.depth });
        } else {
          out.push({ text: r.text, protected: false, blank: false, depth: r.depth });
        }
      }
    }
    i = j;
  }
  return out;
};

const alignItems = (items: Item[]) => {
  let i = 0;
  while (i < items.length) {
    const it = items[i];
    if (it.protected || it.blank || !isDeclLine(it.text)) {
      i++;
      continue;
    }
    let j = i;
    const group: number[] = [];
    while (j < items.length) {
      const jt = items[j];
      if (jt.protected || jt.blank || jt.depth !== it.depth || !isDeclLine(jt.text)) break;
      group.push(j);
      j++;
    }
    if (group.length >= 2) alignGroup(items, group);
    i = Math.max(j, i + 1);
  }
};

export const formatJaiLines = (
  text: string,
  options: FormatOptions,
): { eol: string; lines: string[]; protectedLines: boolean[] } => {
  const { eol, items } = build(text, options);
  return {
    eol,
    lines: items.map((it) => it.text),
    protectedLines: items.map((it) => it.protected),
  };
};

export const formatJai = (text: string, options: FormatOptions): string => {
  const { eol, items: built } = build(text, options);
  const items = handleInlineCases(built, options);
  if (options.alignDeclarations) alignItems(items);

  const collapsed: string[] = [];
  const max = Math.max(0, options.maxBlankLines);
  let blanks = 0;
  for (const it of items) {
    if (it.blank) {
      blanks++;
      if (blanks <= max) collapsed.push("");
    } else {
      blanks = 0;
      collapsed.push(it.text);
    }
  }

  let result = collapsed.join(eol).replace(/(\r\n|\n)+$/, "");
  if (options.insertFinalNewline && result.length > 0) result += eol;
  return result;
};
