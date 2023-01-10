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
const wsl_path_1 = __webpack_require__(8);
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
                        let cmd = `python3 ${(0, wsl_path_1.windowsToWslSync)(cwd)} ${(0, wsl_path_1.windowsToWslSync)(targetFile)}`;
                        cp.exec(cmd, (err, stdout, stderr) => {
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

/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(9), exports);
__exportStar(__webpack_require__(10), exports);


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports._setForceRunInWsl = exports.windowsToWslSync = exports.wslToWindowsSync = exports.wslToWindows = exports.windowsToWsl = exports.resetCache = void 0;
var child_process_1 = __webpack_require__(6);
var path_handling_1 = __webpack_require__(11);
var mount_1 = __webpack_require__(12);
var WSL_UTIL = "wslpath";
var _forceRunInWsl = undefined;
var inMemoryCacheInstance = {};
var inMemoryMountPathCacheInstance = {};
var defaultResolveOptions = {
    wslCommand: "wsl",
};
var resetCache = function () {
    inMemoryCacheInstance = {};
    inMemoryMountPathCacheInstance = {};
};
exports.resetCache = resetCache;
/**
 * Return a promise that resolves with a windows path to it's corresponding POSIX path in the wsl environment.
 * In case the resolution does not succeed, the Promise rejects with the appropriate error response.
 *
 * This calls wslpath(.exe) for resolving the base path and caches it in the default
 * resolve options. Subsequent calls with the same base path are then derived from the cache.
 *
 * If you do not want this, pass custom ResolveOptions with an empty or custom cache.
 * @param windowsPath   The windows path to convert to a posix path
 * @param options       Overwrite the resolver options, e.g. for disabling base caching
 */
var windowsToWsl = function (windowsPath, options) {
    if (options === void 0) { options = __assign({}, defaultResolveOptions); }
    return resolveAsync(buildWindowsResolutionContext(windowsPath, options), options);
};
exports.windowsToWsl = windowsToWsl;
/**
 * Return a promise that resolves a POSIX path to it's corresponding windows path in the wsl environment.
 * This calls wslpath for resolving the base path and caches it in the default
 * resolve options. Subsequent calls with the same base path are then derived from the cache.
 *
 * If you do not want this, pass custom ResolveOptions with an empty or custom cache.
 * @param posixPath   The posix path to convert to a windos path
 * @param options     Overwrite the resolver options, e.g. for disabling base caching
 */
var wslToWindows = function (posixPath, options) {
    if (options === void 0) { options = __assign({}, defaultResolveOptions); }
    return resolveAsync(buildPosixResolutionContext(posixPath, options), options);
};
exports.wslToWindows = wslToWindows;
/**
 * Resolve the POSIX path for the given windows path in the wsl environment in a synchronous call.
 * This calls wslpath for resolving the base path and caches it in the default
 * resolve options. Subsequent calls with the same base path are then derived from the cache.
 *
 * If you do not want this, pass custom ResolveOptions with an empty or custom cache.
 * @param posixPath     The posix path to convert to a posix path
 * @param options       Overwrite the resolver options, e.g. for disabling base caching
 */
var wslToWindowsSync = function (posixPath, options) {
    if (options === void 0) { options = __assign({}, defaultResolveOptions); }
    return resolveSync(buildPosixResolutionContext(posixPath, options), options);
};
exports.wslToWindowsSync = wslToWindowsSync;
/**
 * Resolve the Windows path for the given POSI path in the wsl environment in a synchronous call.
 * In case the resolution does not succeed, the Promise rejects with the appropriate error response.
 *
 * This calls wslpath(.exe) for resolving the base path and caches it in the default
 * resolve options. Subsequent calls with the same base path are then derived from the cache.
 *
 * If you do not want this, pass custom ResolveOptions with an empty or custom cache.
 * @param windowsPath   The windows path to convert to a posix path
 * @param options       Overwrite the resolver options, e.g. for disabling base caching
 */
var windowsToWslSync = function (windowsPath, options) {
    if (options === void 0) { options = __assign({}, defaultResolveOptions); }
    return resolveSync(buildWindowsResolutionContext(windowsPath, options), options);
};
exports.windowsToWslSync = windowsToWslSync;
/**
 * Perform a path resolution for the given @see ResolutionContext in a asynchronous manner.
 *
 * @param context The @see ResolutionContext to resolve.
 * @param options The @see ResolveOptions to resolve
 */
var resolveAsync = function (context, options) {
    var cachedResult = lookupCache(context);
    if (cachedResult) {
        return Promise.resolve(cachedResult);
    }
    return callWslPathUtil(context).then(function (result) {
        var resultContext = buildResolutionContext(result, options);
        cacheValue(context, resultContext);
        return result;
    });
};
/**
 * Perform a path resolution for the given @see ResolutionContext in a synchronous manner.
 *
 * @param context The @see ResolutionContext to resolve.
 * @param options The @see ResolveOptions to resolve
 */
var resolveSync = function (context, options) {
    var cachedResult = lookupCache(context);
    if (cachedResult) {
        return cachedResult;
    }
    var result = callWslPathUtilSync(context);
    var resultContext = buildResolutionContext(result, context);
    cacheValue(context, resultContext);
    return result;
};
/**
 * Execute the wsl path resolution synchronously.
 *
 * @param context The @see ResolutionContext to resolve;
 */
var callWslPathUtilSync = function (context) {
    var wslCall = toWslCommand(context);
    var stdout = (0, child_process_1.execSync)(wslCall).toString();
    return (0, path_handling_1.joinPath)(stdout.trim(), context.restOfPath, !context.isWindowsPath);
};
/**
 * Execute the wsl path resolution asynchronously.
 *
 * @param context The @see ResolutionContext to resolve;
 */
var callWslPathUtil = function (context) {
    var wslCall = toWslCommand(context);
    return new Promise(function (resolve, reject) {
        (0, child_process_1.exec)(wslCall, function (err, stdout, stderr) {
            if (err) {
                reject(err);
            }
            else if (stderr && !stdout) {
                reject((stderr || "").trim());
            }
            else {
                resolve((0, path_handling_1.joinPath)(stdout.trim(), context.restOfPath, !context.isWindowsPath));
            }
        });
    });
};
/**
 * Create the wsl command for resolving the given context.
 *
 * @param context The @see ResolutionContext that should be resolved.
 */
var toWslCommand = function (context) {
    var baseCommand = "".concat(WSL_UTIL, " ").concat(!context.isWindowsPath ? "-w" : "", " ").concat(context.basePath);
    if (process.platform !== "win32" && _forceRunInWsl === false) {
        return baseCommand;
    }
    return context.wslCommand + " " + baseCommand.replace(/\\/g, "\\\\");
};
/**
 * Force to run/not run wslpath in a wsl environment.
 * This is mostly useful for testing scenarios
 */
var _setForceRunInWsl = function (value) {
    return (_forceRunInWsl = value);
};
exports._setForceRunInWsl = _setForceRunInWsl;
/**
 * Return the cache key used for storing and retrieving the given @see ResolutionContext.
 *
 * @param context The context to create the key for.
 */
var cacheKey = function (context) {
    return "".concat(context.wslCommand, ":").concat(context.basePath);
};
/**
 * Mark the resultContext as being the resolution result for sourceContext.
 *
 * @param sourceContext The @see ResolutionContext defining the resolve input.
 * @param resultContext The @see ResolutionContext defining the resolve output.
 */
var cacheValue = function (sourceContext, resultContext) {
    if (sourceContext.isWindowsPath === resultContext.isWindowsPath) {
        return;
    }
    sourceContext.cache[cacheKey(sourceContext)] = resultContext.basePath;
    sourceContext.cache[cacheKey(resultContext)] = sourceContext.basePath;
};
/**
 * Return the result for the given context from the cache if resolution has been already peformed.
 *
 * @param context The @see ResolutionContext to lookup
 */
var lookupCache = function (context) {
    var result = context.cache[cacheKey(context)];
    if (!result) {
        return;
    }
    return (0, path_handling_1.joinPath)(result, context.restOfPath, !context.isWindowsPath);
};
var fetchMountPoints = function (wslCommand) {
    inMemoryMountPathCacheInstance[wslCommand] = (0, mount_1.determineMountPoints)(wslCommand);
    return inMemoryMountPathCacheInstance[wslCommand];
};
/**
 * Create a new @see ResolutionContext from the given path and parse options.
 *
 * @param path    The path to resolve. Can be either POSIX or Windows (see the reverse flag in the result)
 * @param options The parse options provided by the user.
 */
var buildResolutionContext = function (path, options, parser) {
    options.basePathCache = options.basePathCache || inMemoryCacheInstance;
    options.wslCommand = options.wslCommand || "wsl";
    options.mountPoints =
        options.mountPoints ||
            inMemoryMountPathCacheInstance[options.wslCommand] ||
            fetchMountPoints(options.wslCommand);
    // TODO: This actually doesn't cover network shares
    var isWindowsPath = /^\w:\\/i.test(path);
    var _a = (parser || (!isWindowsPath ? path_handling_1.parsePosixPath : path_handling_1.parseWindowsPath))(path, options.mountPoints), basePath = _a[0], restOfPath = _a[1];
    return {
        basePath: basePath,
        restOfPath: restOfPath,
        isWindowsPath: isWindowsPath,
        wslCommand: options.wslCommand,
        cache: options.basePathCache,
    };
};
/**
 * Stricter version of @see buildResolutionContext which only allows windows paths at path.
 * Throws an error if a non windows (with drive letter) path is provided
 *
 * @param path    The windows file path to create a context for.
 * @param options The user provided resolution options
 */
var buildWindowsResolutionContext = function (path, options) {
    var context = buildResolutionContext(path, options, path_handling_1.parseWindowsPath);
    if (!context.isWindowsPath) {
        throw Error("Invalid windows path provided:" + path);
    }
    return context;
};
/**
 * Stricter version of @see buildResolutionContext which only allows POSIX paths at path.
 * Throws an error if a non POSIX path is provided
 *
 * @param path    The POSIX file path to create a context for.
 * @param options The user provided resolution options
 */
var buildPosixResolutionContext = function (path, options) {
    var context = buildResolutionContext(path, options, path_handling_1.parsePosixPath);
    if (context.isWindowsPath) {
        throw Error("Invalid POSIX path provided:" + path);
    }
    return context;
};


/***/ }),
/* 11 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.joinPath = exports.splitByPattern = exports.parseWindowsPath = exports.parsePosixPath = exports.WRONG_POSIX_PATH_ROOT = exports.ERROR_FILEPATH_MUST_BE_ABSOLUTE = void 0;
var path = __importStar(__webpack_require__(5));
exports.ERROR_FILEPATH_MUST_BE_ABSOLUTE = "Can't resolve windows filepath to wsl path: Path must be an absolute windows path";
exports.WRONG_POSIX_PATH_ROOT = "Linux path must reside in /mnt/";
var parsePosixPath = function (linuxPath, mountPoints) {
    var mountPoint = mountPoints.find(function (_a) {
        var src = _a.src;
        return linuxPath.startsWith(src);
    });
    if (!mountPoint || !mountPoint.target) {
        return [path.dirname(linuxPath), path.basename(linuxPath)];
    }
    return [mountPoint.src, linuxPath.substring(mountPoint.src.length)];
};
exports.parsePosixPath = parsePosixPath;
var parseWindowsPath = function (windowsPath, _) {
    try {
        return (0, exports.splitByPattern)(/^(\w+:\\)(.*)$/gi, windowsPath);
    }
    catch (e) {
        throw Error(exports.ERROR_FILEPATH_MUST_BE_ABSOLUTE);
    }
};
exports.parseWindowsPath = parseWindowsPath;
var splitByPattern = function (pattern, path) {
    var drivePattern = pattern.exec(path);
    if (!drivePattern) {
        throw Error("Pattern does not match");
    }
    var _a = drivePattern.slice(1), driveLetter = _a[0], restOfPath = _a[1];
    return [driveLetter, restOfPath];
};
exports.splitByPattern = splitByPattern;
function joinPath(basePath, restOfPath, isWindowsPath) {
    if (isWindowsPath === void 0) { isWindowsPath = false; }
    var platformPath = isWindowsPath ? path.win32 : path.posix;
    if (!isWindowsPath) {
        restOfPath = restOfPath.replace(/\\/gi, '/');
    }
    else {
        restOfPath = restOfPath.replace(/\//gi, '\\');
    }
    return platformPath.join(basePath, restOfPath).trim();
}
exports.joinPath = joinPath;


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.determineMountPoints = void 0;
var child_process_1 = __webpack_require__(6);
/**
 * Module for determining the (linux) mount point of a file
 */
var determineMountPoints = function (wslCommand) {
    var stdout = (0, child_process_1.execSync)("".concat(wslCommand, " -e mount")).toString();
    return stdout
        .trim()
        .split("\n")
        .map(function (line) { return line.split(" "); })
        .map(function (_a) {
        var windowsPath = _a[0], _ = _a[1], linuxPath = _a[2], __ = _a[3], type = _a[4];
        return ({
            src: linuxPath,
            target: type === "9p" || type === "drvfs" ? windowsPath : undefined,
        });
    })
        .sort(function (a, b) { return b.src.length - a.src.length; });
};
exports.determineMountPoints = determineMountPoints;


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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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