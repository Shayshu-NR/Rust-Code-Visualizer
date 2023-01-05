import * as vscode from "vscode";
import * as path from "path";
import { getNonce } from "./utilities";
import { read, readFile, readFileSync } from "fs";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _extensionPath: string
  ) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          webviewView.webview.postMessage({
            type: "infoReceived",
            value: "Received message: " + data.value,
          });
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    console.log("getHTML");
    // Specify where to grab the script that is generated from react...
    try {
      var fs = require("fs");
      var cp = require("child_process");

      cp.exec(`python ${path.join(this._extensionPath, "ext-src", "main.py")}`, (err: any, stdout: any, stderr: any) => {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (err) {
            console.log('error: ' + err);
        }
      });

      const manifest = JSON.parse(
        fs.readFileSync(
          path.join(this._extensionPath, "build", "asset-manifest.json")
        )
      );

      const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "build", manifest["files"]["main.js"])
      );
      const mainCSS = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "build", manifest["files"]["main.css"])
      );

      const nonce = getNonce();

      return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${mainCSS}" rel="stylesheet">
            <script nonce="${nonce}">
              const vscode = acquireVsCodeApi();
            </script>
        </head>
  
        <body>
          <div id="root"></div>
        </body>
        <script src="${scriptUri}" nonce="${nonce}">
      </html>
      `;
    } catch (err) {
      console.log(err);
      return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
  
        <body>
          <div id="root">Extension failed to load</div>
        </body>
      </html>
      `;
    }
  }
}
