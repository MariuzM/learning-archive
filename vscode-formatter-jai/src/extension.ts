import * as vscode from "vscode";
import { formatJai, formatJaiLines, type FormatOptions } from "./formatter";

const readOptions = (options: vscode.FormattingOptions): FormatOptions => {
  const config = vscode.workspace.getConfiguration("jai.format");
  return {
    tabSize: options.tabSize,
    insertSpaces: options.insertSpaces,
    indentCaseContents: config.get<boolean>("indentCaseContents", true),
    spaceAfterComma: config.get<boolean>("spaceAfterComma", true),
    maxBlankLines: config.get<number>("maxBlankLines", 1),
    insertFinalNewline: config.get<boolean>("insertFinalNewline", true),
    operatorSpacing: config.get<boolean>("operatorSpacing", true),
    splitInlineCaseBodies: config.get<boolean>("splitInlineCaseBodies", true),
    alignCaseBodies: config.get<boolean>("alignCaseBodies", true),
    alignDeclarations: config.get<boolean>("alignDeclarations", true),
  };
};

const fullRangeOf = (document: vscode.TextDocument): vscode.Range => {
  const last = Math.max(0, document.lineCount - 1);
  return new vscode.Range(0, 0, last, document.lineAt(last).text.length);
};

export const activate = (context: vscode.ExtensionContext) => {
  const selector: vscode.DocumentSelector = [
    { language: "jai", scheme: "file" },
    { language: "jai", scheme: "untitled" },
  ];

  const documentProvider: vscode.DocumentFormattingEditProvider = {
    provideDocumentFormattingEdits(document, options) {
      const formatted = formatJai(document.getText(), readOptions(options));
      return [vscode.TextEdit.replace(fullRangeOf(document), formatted)];
    },
  };

  const rangeProvider: vscode.DocumentRangeFormattingEditProvider = {
    provideDocumentRangeFormattingEdits(document, range, options) {
      const { lines } = formatJaiLines(document.getText(), readOptions(options));
      const edits: vscode.TextEdit[] = [];
      for (let i = range.start.line; i <= range.end.line; i++) {
        const current = document.lineAt(i);
        const next = lines[i];
        if (next !== undefined && next !== current.text) {
          edits.push(vscode.TextEdit.replace(current.range, next));
        }
      }
      return edits;
    },
  };

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(selector, documentProvider),
    vscode.languages.registerDocumentRangeFormattingEditProvider(selector, rangeProvider),
  );
};

export const deactivate = () => {};
