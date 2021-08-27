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
        var _a, _b, _c;
        try {
            // Get current selection
            if (!vscode.window.activeTextEditor) {
                vscode.window.showErrorMessage("No active editor.");
                return;
            }
            const sourceSelection = vscode.window.activeTextEditor.selection;
            if (sourceSelection.isEmpty) {
                vscode.window.showErrorMessage("No source selected.");
                return;
            }
            const sourceSelectionText = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.getText(sourceSelection);
            const sourceUri = (_b = vscode.window.activeTextEditor) === null || _b === void 0 ? void 0 : _b.document.uri;
            const sourceFilePath = (_c = vscode.window.activeTextEditor) === null || _c === void 0 ? void 0 : _c.document.fileName;
            if (!sourceFilePath) {
                vscode.window.showErrorMessage("No file tab active.");
                return;
            }
            const workingDirectory = path.dirname(sourceFilePath);
            const newComponentName = yield vscode.window.showInputBox({
                title: "Please enter the new component name.",
            });
            if (!newComponentName) {
                return;
            }
            const targetContent = `const ${newComponentName} = (props: {}) => { return ( ${sourceSelectionText} )} 
        
        export default ${newComponentName}`;
            const targetFileName = `${workingDirectory}/${newComponentName}.component.tsx`;
            const targetUri = vscode.Uri.file(targetFileName).with({
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
            yield vscode.commands.executeCommand("vscode.open", targetUri);
            yield vscode.commands.executeCommand("editor.action.formatDocument");
        }
        catch (error) {
            vscode.window.showErrorMessage(JSON.stringify(error));
            console.error(error);
        }
        //
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        // vscode.window.showInformationMessage(
        //   "Hello World from Outsource Component!"
        // );
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map