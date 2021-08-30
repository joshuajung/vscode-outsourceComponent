"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const path = require("path");
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log(
    //   'Congratulations, your extension "outsource-component" is now active!'
    // );
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand("outsource-component.outsourceSelection", () => __awaiter(this, void 0, void 0, function* () {
        vscode.window.withProgress({ location: vscode.ProgressLocation.Notification }, (progress) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            try {
                progress.report({
                    message: "Outsourcing component…",
                    increment: 10,
                });
                // Get current selection
                if (!vscode.window.activeTextEditor) {
                    throw new Error("No active editor.");
                }
                let sourceSelection = vscode.window.activeTextEditor.selection;
                if (!sourceSelection) {
                    throw new Error("No selection.");
                }
                if (sourceSelection.isEmpty) {
                    sourceSelection = new vscode.Selection(new vscode.Position(sourceSelection.start.line, 0), new vscode.Position(sourceSelection.start.line, 9999));
                }
                const sourceSelectionText = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.getText(sourceSelection);
                const sourceUri = (_b = vscode.window.activeTextEditor) === null || _b === void 0 ? void 0 : _b.document.uri;
                const sourceFilePath = (_c = vscode.window.activeTextEditor) === null || _c === void 0 ? void 0 : _c.document.fileName;
                if (!sourceFilePath) {
                    throw new Error("No tab file active.");
                }
                const workingDirectory = path.dirname(sourceFilePath);
                const newComponentNameUncased = yield vscode.window.showInputBox({
                    title: "Please enter the new component name.",
                });
                if (!newComponentNameUncased) {
                    return;
                }
                const newComponentName = newComponentNameUncased.substr(0, 1).toUpperCase() +
                    newComponentNameUncased.substr(1);
                const targetContent = `const ${newComponentName} = () => { return ( ${sourceSelectionText} )} 
          
          export default ${newComponentName}`;
                const targetFileName = newComponentName.substr(0, 1).toLowerCase() +
                    newComponentName.substr(1);
                const targetFilePath = `${workingDirectory}/${targetFileName}.component.tsx`;
                const targetUri = vscode.Uri.file(targetFilePath).with({
                    scheme: "untitled",
                });
                yield vscode.workspace.openTextDocument(targetUri);
                const newSourceContent = `<${newComponentName} />`;
                const edit = new vscode.WorkspaceEdit();
                edit.replace(sourceUri, sourceSelection, newSourceContent);
                edit.insert(targetUri, new vscode.Position(0, 0), targetContent);
                yield vscode.workspace.applyEdit(edit);
                yield vscode.commands.executeCommand("editor.action.formatDocument");
                vscode.window.activeTextEditor.selection = new vscode.Selection(new vscode.Position(sourceSelection.start.line, 0), new vscode.Position(sourceSelection.start.line, 9999));
                try {
                    yield vscode.commands.executeCommand("vscode.open", targetUri);
                }
                catch (_f) {
                    throw new Error("Cannot create component file – it likely already exists.");
                }
                yield vscode.commands.executeCommand("editor.action.formatDocument");
                yield vscode.commands.executeCommand("workbench.action.files.save");
                progress.report({ increment: 20 });
                yield awaitTimeout(2000);
                progress.report({ increment: 70 });
                yield vscode.commands.executeCommand("editor.action.codeAction", {
                    kind: "source.addMissingImports",
                });
                yield vscode.commands.executeCommand("workbench.action.files.save");
                yield vscode.commands.executeCommand("vscode.open", sourceUri);
                yield awaitTimeout(2000);
                progress.report({ increment: 95 });
                yield vscode.commands.executeCommand("editor.action.codeAction", {
                    kind: "source.addMissingImports",
                });
                yield vscode.commands.executeCommand("editor.action.formatDocument");
                vscode.window.showInformationMessage("Outsourcing completed.");
                progress.report({ increment: 100 });
            }
            catch (error) {
                vscode.window.showErrorMessage((_e = (_d = error) === null || _d === void 0 ? void 0 : _d.message) !== null && _e !== void 0 ? _e : "Unknown error.");
                console.error(error);
            }
            finally {
            }
        }));
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function awaitTimeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map