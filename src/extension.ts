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
      vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification },
        async (progress) => {
          try {
            progress.report({
              message: "Outsourcing componentâ€¦",
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
              sourceSelection = new vscode.Selection(
                new vscode.Position(sourceSelection.start.line, 0),
                new vscode.Position(sourceSelection.start.line, 9999)
              );
            }
            const sourceSelectionText =
              vscode.window.activeTextEditor?.document.getText(sourceSelection);
            const sourceUri = vscode.window.activeTextEditor?.document.uri;
            const sourceFilePath =
              vscode.window.activeTextEditor?.document.fileName;
            if (!sourceFilePath) {
              throw new Error("No tab file active.");
            }
            const workingDirectory = path.dirname(sourceFilePath);

            const newComponentNameUncased = await vscode.window.showInputBox({
              title: "Please enter the new component name.",
            });
            if (!newComponentNameUncased) {
              return;
            }
            const newComponentName =
              newComponentNameUncased.substr(0, 1).toUpperCase() +
              newComponentNameUncased.substr(1);
            const targetContent = `const ${newComponentName} = () => { return ( ${sourceSelectionText} )} 
          
          export default ${newComponentName}`;
            const targetFileName =
              newComponentName.substr(0, 1).toLowerCase() +
              newComponentName.substr(1);
            const targetFilePath = `${workingDirectory}/${targetFileName}.component.tsx`;
            const targetUri = vscode.Uri.file(targetFilePath).with({
              scheme: "untitled",
            });
            await vscode.workspace.openTextDocument(targetUri);
            const newSourceContent = `<${newComponentName} />`;

            const edit = new vscode.WorkspaceEdit();
            edit.replace(sourceUri, sourceSelection, newSourceContent);
            edit.insert(targetUri, new vscode.Position(0, 0), targetContent);
            await vscode.workspace.applyEdit(edit);
            await vscode.commands.executeCommand(
              "editor.action.formatDocument"
            );
            vscode.window.activeTextEditor.selection = new vscode.Selection(
              new vscode.Position(sourceSelection.start.line, 0),
              new vscode.Position(sourceSelection.start.line, 9999)
            );
            try {
              await vscode.commands.executeCommand("vscode.open", targetUri);
            } catch {
              throw new Error(
                "Cannot create component file â€“ it likely already exists."
              );
            }
            await vscode.commands.executeCommand(
              "editor.action.formatDocument"
            );
            await vscode.commands.executeCommand("workbench.action.files.save");
            progress.report({ increment: 20 });
            await awaitTimeout(2000);
            progress.report({ increment: 70 });
            await vscode.commands.executeCommand("editor.action.codeAction", {
              kind: "source.addMissingImports",
            });
            await vscode.commands.executeCommand("workbench.action.files.save");
            await vscode.commands.executeCommand("vscode.open", sourceUri);
            await awaitTimeout(2000);
            progress.report({ increment: 95 });
            await vscode.commands.executeCommand("editor.action.codeAction", {
              kind: "source.addMissingImports",
            });
            await vscode.commands.executeCommand(
              "editor.action.formatDocument"
            );
            vscode.window.showInformationMessage("Outsourcing completed.");
            progress.report({ increment: 100 });
          } catch (error) {
            vscode.window.showErrorMessage(
              (error as any)?.message ?? "Unknown error."
            );
            console.error(error);
          } finally {
          }
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

function awaitTimeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// this method is called when your extension is deactivated
export function deactivate() {}
