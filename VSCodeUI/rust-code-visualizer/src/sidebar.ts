import * as vscode from "vscode";
import { getNonce } from "./utilities";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

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
    // Specify where to grab the script that is generated from react...
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.865a89d0.js")
    );

    const mainCSS = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.5e90d8e1.css")
    );
   
    const outputCSS = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "output.css")
    );

    // Specify where to grab the css for the panel
    const stylesResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );

    // More css to add to the panel
    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    
    const manifestUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "manifest.json")
    );



    const nonce = getNonce();

    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${stylesResetUri}" rel="stylesheet">
          <link href="${stylesMainUri}" rel="stylesheet">
          <link href="${mainCSS}" rel="stylesheet">
          <link href="${outputCSS}" rel="stylesheet">
          <link rel="manifest" href="${manifestUri}" />
          <script nonce="${nonce}">
          </script>
      </head>

      <body>
        <div id="root"></div>
      </body>
      <script src="${scriptUri}" nonce="${nonce}">
    </html>
    `;
  }
}
