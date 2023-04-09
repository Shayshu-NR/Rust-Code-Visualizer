import * as vscode from "vscode";
import * as path from "path";
import { getNonce } from "./utilities";
import { readFileSync, createReadStream } from "fs";
import { createHash } from "crypto";
import { create } from "domain";
import { env } from "process";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  _hashFile?: string;

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
        case "reqProfileData": {
          if (!data.value) {
            return;
          }

          var cp = require("child_process");
          var fs = require("fs");

          if (vscode.workspace.workspaceFolders !== undefined) {
            let scriptPath: string = path.join(
              this._extensionPath,
              "ext-src",
              "scripts",
              "profilerChartData.py"
            );
            let targetFile: string = path.join(
              vscode.workspace.workspaceFolders[0].uri.fsPath,
              data.value
            );

            let currentHash = this.createFileHash(targetFile, fs);
            if (this.getStaticFileContent(currentHash, "profiler", fs)) {
              console.log("Cache Hit! - Profiler Data");
              try {
                let chartData = JSON.parse(
                  fs.readFileSync(
                    path.join(
                      this._extensionPath,
                      "data",
                      "profiler_graphs.json"
                    )
                  )
                );

                let tableData = JSON.parse(
                  fs.readFileSync(
                    path.join(
                      this._extensionPath,
                      "data",
                      "profiling_data.json"
                    )
                  )
                );
                webviewView.webview.postMessage({
                  type: "profileDataResults",
                  value: {
                    chart: chartData,
                    table: tableData,
                  },
                });
                return;
              } catch (err) {
                return;
              }
            }

            let cmd: string = `bash -l -c "python3 ${scriptPath} ${targetFile}"`;

            console.log(cmd);

            cp.exec(cmd, (err: any, stdout: any, stderr: any) => {
              console.log("Profiler Error:", stderr);
              try {
                let chartData = JSON.parse(
                  fs.readFileSync(
                    path.join(
                      this._extensionPath,
                      "data",
                      "profiler_graphs.json"
                    )
                  )
                );

                let tableData = JSON.parse(
                  fs.readFileSync(
                    path.join(
                      this._extensionPath,
                      "data",
                      "profiling_data.json"
                    )
                  )
                );
                webviewView.webview.postMessage({
                  type: "profileDataResults",
                  value: {
                    chart: chartData,
                    table: tableData,
                  },
                });
              } catch (err) {
                return;
              }
            });
          }
          break;
        }
        case "reqGraphData": {
          var cp = require("child_process");
          var fs = require("fs");

          if (vscode.workspace.workspaceFolders !== undefined) {
            let scriptPath: string = path.join(
              this._extensionPath,
              "ext-src",
              "scripts",
              "grapher.py"
            );
            let dataPath: string = path.join(
              this._extensionPath,
              "data",
              "cyto.json"
            );
            let targetFile = vscode.workspace.workspaceFolders[0].uri.fsPath;
            let targetRustFile = path.join(
              vscode.workspace.workspaceFolders[0].uri.fsPath,
              data.value
            );

            let currentHash = this.createFileHash(targetRustFile, fs);
            if (this.getStaticFileContent(currentHash, "call-graph", fs)) {
              console.log("Cache Hit! - Graph Data");
              try {
                let graphData = JSON.parse(
                  fs.readFileSync(
                    path.join(this._extensionPath, "data", "cyto.json")
                  )
                );

                webviewView.webview.postMessage({
                  type: "graphDataResults",
                  value: graphData,
                });
                return;
              } catch (err) {
                return;
              }
            }
            let envCmd: string = `source ${path.join(this._extensionPath, 'rcv', 'bin', 'activate')}`;
            
            let cmd: string = `${envCmd} && python3 ${scriptPath} -p ${targetFile} -o ${dataPath}`;

            cp.exec(cmd, {shell: '/bin/bash'}, (err: any, stdout: any, stderr: any) => {
              console.log("Graph Error:", err, stdout, stderr);
              let graphData = JSON.parse(
                fs.readFileSync(
                  path.join(this._extensionPath, "data", "cyto.json")
                )
              );

              webviewView.webview.postMessage({
                type: "graphDataResults",
                value: graphData,
              });
            });
          }
          break;
        }
        case "reqFiles": {
          if (!data.value) {
            return;
          }
          if (vscode.workspace.workspaceFolders !== undefined) {
            var fs = require("fs");
            let rustFiles: string[] = [];

            fs.readdirSync(
              vscode.workspace.workspaceFolders[0].uri.fsPath
            ).forEach((file: string) => {
              if (file.endsWith(".rs")) {
                rustFiles.push(file);
              }
            });

            webviewView.webview.postMessage({
              type: "filesResults",
              value: rustFiles,
            });
          }

          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private createFileHash(fileName: string, fs: any): string {
    var crypt = require("crypto");
    const input = fs.readFileSync(fileName);
    const hash = crypt.createHash("sha256");
    hash.update(input);
    const digest: string = hash.digest("hex");
    return digest;
  }

  private getStaticFileContent(
    challengeHash: string,
    dataRequester: string,
    fs: any
  ): boolean {
    let hashFileLocation = path.join(
      this._extensionPath,
      "data",
      `hash-${dataRequester}.txt`
    );

    if (fs.existsSync(hashFileLocation)) {
      this._hashFile = fs.readFileSync(hashFileLocation, "utf8");
      if (this._hashFile === challengeHash) {
        return true;
      }
      fs.writeFileSync(hashFileLocation, challengeHash);

      return false;
    } else {
      fs.writeFileSync(hashFileLocation, challengeHash);

      return false;
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Specify where to grab the script that is generated from react...
    try {
      var fs = require("fs");
      var cp = require("child_process");

      const manifest = JSON.parse(
        fs.readFileSync(
          path.join(this._extensionPath, "build", "asset-manifest.json")
        )
      );

      const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(
          this._extensionUri,
          "build",
          manifest["files"]["main.js"]
        )
      );
      const mainCSS = webview.asWebviewUri(
        vscode.Uri.joinPath(
          this._extensionUri,
          "build",
          manifest["files"]["main.css"]
        )
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
