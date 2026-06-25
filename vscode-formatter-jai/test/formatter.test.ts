import { expect, test, describe } from "bun:test";
import { formatJai, formatJaiLines, type FormatOptions } from "../src/formatter";

const opts = (over: Partial<FormatOptions> = {}): FormatOptions => ({
  tabSize: 4,
  insertSpaces: true,
  indentCaseContents: true,
  spaceAfterComma: true,
  maxBlankLines: 1,
  insertFinalNewline: false,
  operatorSpacing: false,
  splitInlineCaseBodies: false,
  alignCaseBodies: false,
  alignDeclarations: false,
  ...over,
});

const fmt = (text: string, over: Partial<FormatOptions> = {}) => formatJai(text, opts(over));

describe("indentation", () => {
  test("reindents nested blocks", () => {
    const input = ["main :: () {", "foo();", "if x {", "bar();", "}", "}"].join("\n");
    const expected = [
      "main :: () {",
      "    foo();",
      "    if x {",
      "        bar();",
      "    }",
      "}",
    ].join("\n");
    expect(fmt(input)).toBe(expected);
  });

  test("collapses over-indentation back to the correct level", () => {
    const input = ["main :: () {", "            foo();", "}"].join("\n");
    expect(fmt(input)).toBe(["main :: () {", "    foo();", "}"].join("\n"));
  });

  test("formats struct members", () => {
    const input = ["Vector3 :: struct {", "x: float;", "y: float;", "z: float;", "}"].join("\n");
    const expected = [
      "Vector3 :: struct {",
      "    x: float;",
      "    y: float;",
      "    z: float;",
      "}",
    ].join("\n");
    expect(fmt(input)).toBe(expected);
  });

  test("handles } else {", () => {
    const input = ["if a {", "x();", "} else {", "y();", "}"].join("\n");
    const expected = ["if a {", "    x();", "} else {", "    y();", "}"].join("\n");
    expect(fmt(input)).toBe(expected);
  });

  test("indents multi-line argument lists by paren depth", () => {
    const input = ["result := add(", "a,", "b,", ");"].join("\n");
    const expected = ["result := add(", "    a,", "    b,", ");"].join("\n");
    expect(fmt(input)).toBe(expected);
  });

  test("uses tabs when insertSpaces is false", () => {
    const input = ["main :: () {", "foo();", "}"].join("\n");
    const expected = ["main :: () {", "\tfoo();", "}"].join("\n");
    expect(fmt(input, { insertSpaces: false })).toBe(expected);
  });

  test("respects tabSize", () => {
    const input = ["main :: () {", "foo();", "}"].join("\n");
    const expected = ["main :: () {", "  foo();", "}"].join("\n");
    expect(fmt(input, { tabSize: 2 })).toBe(expected);
  });
});

describe("literals and comments are not treated as code", () => {
  test("ignores braces inside string literals", () => {
    const input = ['s := "}{";', "foo();"].join("\n");
    expect(fmt(input)).toBe(['s := "}{";', "foo();"].join("\n"));
  });

  test("ignores braces inside line comments", () => {
    const input = ["foo(); // }{ not real", "bar();"].join("\n");
    expect(fmt(input)).toBe(["foo(); // }{ not real", "bar();"].join("\n"));
  });

  test("handles nested block comments", () => {
    const input = ["/* outer /* inner */ still */", "foo();"].join("\n");
    expect(fmt(input)).toBe(["/* outer /* inner */ still */", "foo();"].join("\n"));
  });

  test("leaves block-comment body lines verbatim", () => {
    const input = ["x := 1;", "/*", "   keep   {  this", " */", "y := 2;"].join("\n");
    const expected = ["x := 1;", "/*", "   keep   {  this", " */", "y := 2;"].join("\n");
    expect(fmt(input)).toBe(expected);
  });

  test("preserves #string here-strings verbatim and ignores their braces", () => {
    const input = [
      "text :: #string DONE",
      "    raw {{{ content",
      "        DONE_NOT",
      "DONE",
      "after();",
    ].join("\n");
    const expected = [
      "text :: #string DONE",
      "    raw {{{ content",
      "        DONE_NOT",
      "DONE",
      "after();",
    ].join("\n");
    expect(fmt(input)).toBe(expected);
  });
});

describe("case blocks", () => {
  const input = [
    "handle :: (x: int) {",
    "if x == {",
    "case 1;",
    "foo();",
    "case 2;",
    "bar();",
    "}",
    "}",
  ].join("\n");

  test("indents case contents when enabled", () => {
    const expected = [
      "handle :: (x: int) {",
      "    if x == {",
      "        case 1;",
      "            foo();",
      "        case 2;",
      "            bar();",
      "    }",
      "}",
    ].join("\n");
    expect(fmt(input)).toBe(expected);
  });

  test("keeps case contents flat when disabled", () => {
    const expected = [
      "handle :: (x: int) {",
      "    if x == {",
      "        case 1;",
      "        foo();",
      "        case 2;",
      "        bar();",
      "    }",
      "}",
    ].join("\n");
    expect(fmt(input, { indentCaseContents: false })).toBe(expected);
  });
});

describe("whitespace hygiene", () => {
  test("strips trailing whitespace", () => {
    const input = ["foo();   ", "bar();\t"].join("\n");
    expect(fmt(input)).toBe(["foo();", "bar();"].join("\n"));
  });

  test("empties whitespace-only lines without adding indent", () => {
    const input = ["main :: () {", "    ", "foo();", "}"].join("\n");
    expect(fmt(input)).toBe(["main :: () {", "", "    foo();", "}"].join("\n"));
  });

  test("preserves CRLF line endings", () => {
    const input = ["main :: () {", "foo();", "}"].join("\r\n");
    expect(fmt(input)).toBe(["main :: () {", "    foo();", "}"].join("\r\n"));
  });
});

describe("comma and semicolon spacing", () => {
  test("normalizes spacing around commas", () => {
    expect(fmt("foo(a,b ,  c);")).toBe("foo(a, b, c);");
  });

  test("removes space before semicolons", () => {
    expect(fmt("x := 1 ;")).toBe("x := 1;");
  });

  test("keeps trailing commas tight to the line end", () => {
    const input = ["call(", "a,", "b,", ");"].join("\n");
    expect(fmt(input)).toBe(["call(", "    a,", "    b,", ");"].join("\n"));
  });

  test("does not add a space before a closing bracket", () => {
    expect(fmt("arr := .[1, 2,];")).toBe("arr := .[1, 2,];");
  });

  test("never touches commas inside strings or comments", () => {
    expect(fmt('s := "a,b,c"; // x,y,z')).toBe('s := "a,b,c"; // x,y,z');
  });

  test("can be disabled", () => {
    expect(fmt("foo(a,b);", { spaceAfterComma: false })).toBe("foo(a,b);");
  });
});

describe("blank lines and final newline", () => {
  test("collapses runs of blank lines to the configured maximum", () => {
    const input = ["a();", "", "", "", "b();"].join("\n");
    expect(fmt(input, { maxBlankLines: 1 })).toBe(["a();", "", "b();"].join("\n"));
  });

  test("can remove all blank lines", () => {
    const input = ["a();", "", "", "b();"].join("\n");
    expect(fmt(input, { maxBlankLines: 0 })).toBe(["a();", "b();"].join("\n"));
  });

  test("never collapses blank lines inside a here-string", () => {
    const input = ["t :: #string END", "line one", "", "", "line two", "END"].join("\n");
    expect(fmt(input, { maxBlankLines: 0 })).toBe(input);
  });

  test("adds a final newline when enabled", () => {
    expect(fmt("foo();", { insertFinalNewline: true })).toBe("foo();\n");
  });

  test("strips extra trailing blank lines down to one newline", () => {
    expect(fmt(["foo();", "", "", ""].join("\n"), { insertFinalNewline: true })).toBe("foo();\n");
  });
});

describe("operator spacing", () => {
  const o = { operatorSpacing: true };

  test("spaces declaration and comparison operators", () => {
    expect(fmt("x:=a;", o)).toBe("x := a;");
    expect(fmt("PI::3;", o)).toBe("PI :: 3;");
    expect(fmt("if n==0 {", o)).toBe("if n == 0 {");
    expect(fmt("a!=b", o)).toBe("a != b");
    expect(fmt("c+=1;", o)).toBe("c += 1;");
    expect(fmt("x:int=5;", o)).toBe("x: int = 5;");
  });

  test("collapses extra spacing around operators", () => {
    expect(fmt("x   :=   a;", o)).toBe("x := a;");
  });

  test("leaves pointers, dereferences and arithmetic alone", () => {
    expect(fmt("p: *int = null;", o)).toBe("p: *int = null;");
    expect(fmt("y := a*b + c - d;", o)).toBe("y := a*b + c - d;");
    expect(fmt("x: int = ---;", o)).toBe("x: int = ---;");
    expect(fmt("r := 1..10;", o)).toBe("r := 1..10;");
  });

  test("never rewrites operators inside strings or comments", () => {
    expect(fmt('s := "a==b"; // c:=d', o)).toBe('s := "a==b"; // c:=d');
  });

  test("handles the return arrow", () => {
    expect(fmt("f :: (a: int)->int {", o)).toBe("f :: (a: int) -> int {");
  });
});

describe("split inline case bodies", () => {
  test("moves an inline statement onto its own line", () => {
    const input = ["if x == {", "case 1;foo();", "}"].join("\n");
    const expected = ["if x == {", "    case 1;", "        foo();", "}"].join("\n");
    expect(fmt(input, { splitInlineCaseBodies: true, indentCaseContents: true })).toBe(expected);
  });

  test("aligns a run of inline case bodies instead of splitting", () => {
    const input = [
      "if name == {",
      'case "a"; r = f1();',
      'case "bbb"; r = f2();',
      "}",
    ].join("\n");
    const expected = [
      "if name == {",
      '    case "a";   r = f1();',
      '    case "bbb"; r = f2();',
      "}",
    ].join("\n");
    expect(fmt(input, {
      splitInlineCaseBodies: true,
      alignCaseBodies: true,
      operatorSpacing: true,
      indentCaseContents: true,
    })).toBe(expected);
  });

  test("leaves a bare case label untouched", () => {
    const input = ["if x == {", "case 1;", "}"].join("\n");
    const expected = ["if x == {", "    case 1;", "}"].join("\n");
    expect(fmt(input, { splitInlineCaseBodies: true, indentCaseContents: true })).toBe(expected);
  });

  test("keeps a trailing comment with the label", () => {
    const input = ["if x == {", "case 1; // note", "}"].join("\n");
    const expected = ["if x == {", "    case 1; // note", "}"].join("\n");
    expect(fmt(input, { splitInlineCaseBodies: true, indentCaseContents: true })).toBe(expected);
  });
});

describe("align declarations", () => {
  test("aligns value assignments with the colon kept tight to the name", () => {
    const input = ["x: int = 1;", "foo: float = 2.0;"].join("\n");
    const expected = ["x:   int   = 1;", "foo: float = 2.0;"].join("\n");
    expect(fmt(input, { alignDeclarations: true, operatorSpacing: true })).toBe(expected);
  });

  test("aligns struct field types without a space before the colon", () => {
    const input = ["P :: struct {", "x: float;", "longer: float;", "}"].join("\n");
    const expected = ["P :: struct {", "    x:      float;", "    longer: float;", "}"].join("\n");
    expect(fmt(input, { alignDeclarations: true, operatorSpacing: true })).toBe(expected);
  });

  test("removes a space typed before a single colon", () => {
    expect(fmt("x : int = 5;", { operatorSpacing: true })).toBe("x: int = 5;");
  });

  test("does not align across a blank line or non-declaration", () => {
    const input = ["a := 1;", "", "bb := 2;"].join("\n");
    expect(fmt(input, { alignDeclarations: true, operatorSpacing: true })).toBe(input);
  });

  test("is idempotent with all passes enabled", () => {
    const all = {
      operatorSpacing: true,
      splitInlineCaseBodies: true,
      alignCaseBodies: true,
      alignDeclarations: true,
      insertFinalNewline: true,
    };
    const input = [
      "Thing :: struct {",
      "id: int = 0;",
      "name: string = \"x\";",
      "}",
      "",
      "run :: () {",
      "if v == {",
      "case 1;a();",
      "case 2;b();",
      "}",
      "}",
    ].join("\n");
    const once = fmt(input, all);
    expect(fmt(once, all)).toBe(once);
  });
});

describe("structural invariants", () => {
  test("never changes the number of lines", () => {
    const input = ["a {", "b {", "c();", "}", "}", "", "d();"].join("\n");
    expect(formatJaiLines(input, opts()).lines.length).toBe(input.split("\n").length);
  });

  test("is idempotent", () => {
    const input = ["main :: () {", "if a {", "foo();", "} else {", "bar();", "}", "}"].join("\n");
    const once = fmt(input);
    expect(fmt(once)).toBe(once);
  });

  test("does not over-dedent on stray closing braces", () => {
    const input = ["}", "}", "foo();"].join("\n");
    expect(fmt(input)).toBe(["}", "}", "foo();"].join("\n"));
  });
});
