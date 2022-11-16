import * as vscode from "vscode";
import * as util from "./utilities";
import {Panel} from "./panel";
import { SidebarProvider } from "./sidebar";

export function activate(context: vscode.ExtensionContext) {

  // Register a VSCode command and push it to the subscriptions so it can be called 
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "rust-code-visualizer.helloWorld",
      () => {
        vscode.window.showInformationMessage("Hello from Rust-Code-Visualizer!");
      }
    )
  );

  context.subscriptions.push(
    
    vscode.commands.registerCommand(
      "rust-code-visualizer.Graph", 
      () => {
        Panel.createOrShow(context.extensionUri);
      }
    )
  );

  const sidebarProvider = new SidebarProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "rust-sidebar",
      sidebarProvider
    )
  )
}

export function deactivate() {}
