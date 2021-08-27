// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log(
  //   'Congratulations, your extension "outsource-component" is now active!'
  // );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "outsource-component.outsourceSelection",
    async () => {
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
        const sourceSelectionText =
          vscode.window.activeTextEditor?.document.getText(sourceSelection);
        const sourceUri = vscode.window.activeTextEditor?.document.uri;
        const sourceFilePath =
          vscode.window.activeTextEditor?.document.fileName;
        if (!sourceFilePath) {
          vscode.window.showErrorMessage("No file tab active.");
          return;
        }
        const workingDirectory = path.dirname(sourceFilePath);

        const newComponentName = await vscode.window.showInputBox({
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
        await vscode.workspace.openTextDocument(targetUri);
        const newSourceContent = `<${newComponentName} />`;

        const edit = new vscode.WorkspaceEdit();
        edit.replace(sourceUri, sourceSelection, newSourceContent);
        edit.insert(targetUri, new vscode.Position(0, 0), targetContent);
        await vscode.workspace.applyEdit(edit);
        await vscode.commands.executeCommand("editor.action.formatDocument");
        vscode.window.activeTextEditor.selection = new vscode.Selection(
          new vscode.Position(sourceSelection.start.line, 0),
          new vscode.Position(sourceSelection.start.line, 9999)
        );
        await vscode.commands.executeCommand("vscode.open", targetUri);
        await vscode.commands.executeCommand("editor.action.formatDocument");
      } catch (error) {
        vscode.window.showErrorMessage(JSON.stringify(error));
        console.error(error);
      }
      //

      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      // vscode.window.showInformationMessage(
      //   "Hello World from Outsource Component!"
      // );
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
