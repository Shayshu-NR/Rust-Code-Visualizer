/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Panel = void 0;
const vscode = __webpack_require__(1);
const utilities_1 = __webpack_require__(3);
/**
 *
 *
 * @export
 * @class Panel
 */
class Panel {
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it.
        if (Panel.currentPanel) {
            Panel.currentPanel._panel.reveal(column);
            Panel.currentPanel._update();
            return;
        }
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(Panel.viewType, "Panel", column || vscode.ViewColumn.One, {
            // Enable javascript in the webview
            enableScripts: true,
            // And restrict the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, "media"),
                vscode.Uri.joinPath(extensionUri, "out/compiled"),
            ],
        });
        Panel.currentPanel = new Panel(panel, extensionUri);
    }
    static kill() {
        Panel.currentPanel?.dispose();
        Panel.currentPanel = undefined;
    }
    static revive(panel, extensionUri) {
        Panel.currentPanel = new Panel(panel, extensionUri);
    }
    dispose() {
        Panel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    async _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
        // When the webview receives a message back from the user what should we do?
        webview.onDidReceiveMessage(async (data) => {
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
    _getHtmlForWebview(webview) {
        // Specify where to grab the script that is generated from react...
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.865a89d0.js"));
        const mainCSS = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.5e90d8e1.css"));
        const outputCSS = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "output.css"));
        // Specify where to grab the css for the panel
        const stylesResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
        // More css to add to the panel
        const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
        const manifestUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "manifest.json"));
        const nonce = (0, utilities_1.getNonce)();
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
exports.Panel = Panel;
Panel.viewType = "hello-world";


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getNonce = void 0;
/**
 * Creates a number only used once for unique IDs
 *
 * @export
 * @return {*}  {string}
 */
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
exports.getNonce = getNonce;


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SidebarProvider = void 0;
const vscode = __webpack_require__(1);
const path = __webpack_require__(5);
const utilities_1 = __webpack_require__(3);
// import { spawnSync } from "child_process";
// import { windowsToWslSync } from "wsl-path";
class SidebarProvider {
    constructor(_extensionUri, _extensionPath) {
        this._extensionUri = _extensionUri;
        this._extensionPath = _extensionPath;
    }
    resolveWebviewView(webviewView) {
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
                    var cp = __webpack_require__(6);
                    var fs = __webpack_require__(7);
                    if (vscode.workspace.workspaceFolders !== undefined) {
                        let cwd = path.join(this._extensionPath, "ext-src", "scripts", "profilerChartData.py");
                        let targetFile = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, data.value);
                        let cmd = `python3 ${cwd} ${targetFile}`;
                        cp.exec(cmd, (err, stdout, stderr) => {
                            try {
                                let chartData = JSON.parse(fs.readFileSync(path.join(this._extensionPath, "data", "profiler_graphs.json")));
                                let tableData = JSON.parse(fs.readFileSync(path.join(this._extensionPath, "data", "profiling_data.json")));
                                webviewView.webview.postMessage({
                                    type: "profileDataResults",
                                    value: {
                                        chart: chartData,
                                        table: tableData,
                                    },
                                });
                            }
                            catch (err) {
                                console.log(err);
                                return;
                            }
                        });
                    }
                    break;
                }
                case "reqFiles": {
                    if (!data.value) {
                        return;
                    }
                    if (vscode.workspace.workspaceFolders !== undefined) {
                        var fs = __webpack_require__(7);
                        let rustFiles = [];
                        fs.readdirSync(vscode.workspace.workspaceFolders[0].uri.fsPath).forEach((file) => {
                            if (file.endsWith(".rs")) {
                                rustFiles.push(file);
                            }
                        });
                        console.log(rustFiles);
                        webviewView.webview.postMessage({
                            type: "filesResults",
                            value: rustFiles,
                        });
                    }
                    break;
                }
                case "reqGraphData": {
                    var cp = __webpack_require__(6);
                    let cwd = path.join(this._extensionPath, "ext-src", "scripts", "grapher.py");
                    let targetFile = "";
                    let cmd = `python3 ${cwd} ${targetFile}`;
                    cp.exec(cmd, (err, stdout, stderr) => { });
                    break;
                }
            }
        });
    }
    revive(panel) {
        this._view = panel;
    }
    _getHtmlForWebview(webview) {
        console.log("getHTML");
        // Specify where to grab the script that is generated from react...
        try {
            var fs = __webpack_require__(7);
            var cp = __webpack_require__(6);
            const manifest = JSON.parse(fs.readFileSync(path.join(this._extensionPath, "build", "asset-manifest.json")));
            const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "build", manifest["files"]["main.js"]));
            const mainCSS = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "build", manifest["files"]["main.css"]));
            const nonce = (0, utilities_1.getNonce)();
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
        }
        catch (err) {
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
exports.SidebarProvider = SidebarProvider;


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("fs");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __webpack_require__(1);
const panel_1 = __webpack_require__(2);
const sidebar_1 = __webpack_require__(4);
function activate(context) {
    // Register a VSCode command and push it to the subscriptions so it can be called 
    context.subscriptions.push(vscode.commands.registerCommand("rust-code-visualizer.helloWorld", () => {
        vscode.window.showInformationMessage("Hello from Rust-Code-Visualizer!");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("rust-code-visualizer.Graph", () => {
        panel_1.Panel.createOrShow(context.extensionUri);
    }));
    const sidebarProvider = new sidebar_1.SidebarProvider(context.extensionUri, context.extensionPath);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("rust-sidebar", sidebarProvider));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map