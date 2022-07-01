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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hostOrbit = exports.OrbitConnection = void 0;
var ssx_wasm_1 = require("@spruceid/ssx-wasm");
var authenticator_1 = require("./authenticator");
var kv_1 = require("./kv");
/**
 * A connection to an orbit in a Kepler instance.
 *
 * This class provides methods for interacting with an orbit. Construct an instance of this class using {@link Kepler.orbit}.
 */
var OrbitConnection = /** @class */ (function () {
    /** @ignore */
    function OrbitConnection(keplerUrl, authn) {
        var _this = this;
        this.authn = authn;
        this.serialise = function () { return _this.authn.serialise(); };
        this.orbitId = authn.getOrbitId();
        this.kv = new kv_1.KV(keplerUrl, authn);
    }
    /** Get the id of the connected orbit.
     *
     * @returns The id of the connected orbit.
     */
    OrbitConnection.prototype.id = function () {
        return this.orbitId;
    };
    /** Store an object in the connected orbit.
     *
     * Supports storing values that are of type string,
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object | Object},
     * and values that are a {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob | Blob} or Blob-like
     * (e.g. {@link https://developer.mozilla.org/en-US/docs/Web/API/File | File}).
     * ```ts
     * await orbitConnection.put('a', 'value');
     * await orbitConnection.put('b', {x: 10});
     *
     * let blob: Blob = new Blob(['value'], {type: 'text/plain'});
     * await orbitConnection.put('c', blob);
     *
     * let file: File = fileList[0];
     * await orbitConnection.put('d', file);
     * ```
     *
     * @param key The key with which the object is indexed.
     * @param value The value to be stored.
     * @param req Optional request parameters.
     * @returns A {@link Response} without the `data` property.
     */
    OrbitConnection.prototype.put = function (key, value, req) {
        return __awaiter(this, void 0, void 0, function () {
            var transformResponse, blob;
            return __generator(this, function (_a) {
                if (value === null || value === undefined) {
                    return [2 /*return*/, Promise.reject("TypeError: value of type " + typeof value + " cannot be stored.")];
                }
                transformResponse = function (response) {
                    var ok = response.ok, status = response.status, statusText = response.statusText, headers = response.headers;
                    return { ok: ok, status: status, statusText: statusText, headers: headers };
                };
                if (value instanceof Blob) {
                    blob = value;
                }
                else if (typeof value === "string") {
                    blob = new Blob([value], { type: "text/plain" });
                }
                else if (value.constructor && value.constructor.name === "Object") {
                    blob = new Blob([JSON.stringify(value)], { type: "application/json" });
                }
                else {
                    return [2 /*return*/, Promise.reject("TypeError: value of type " + typeof value + " cannot be stored.")];
                }
                // @ts-ignore
                return [2 /*return*/, this.kv.put(key, blob, {}).then(transformResponse)];
            });
        });
    };
    /** Retrieve an object from the connected orbit.
     *
     * String and Object values, along with
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob | Blobs}
     * of type `text/plain` or `application/json` are converted into their respective
     * types on retrieval:
     * ```ts
     * await orbitConnection.put('string', 'value');
     * await orbitConnection.put('json', {x: 10});
     *
     * let blob = new Blob(['value'], {type: 'text/plain'});
     * await orbitConnection.put('stringBlob', blob);
     *
     * let blob = new Blob([{x: 10}], {type: 'application/json'});
     * await orbitConnection.put('jsonBlob', blob);
     *
     * let stringData: string = await orbitConnection.get('string').then(({ data }) => data);
     * let jsonData: {x: number} = await orbitConnection.get('json').then(({ data }) => data);
     * let stringBlobData: string = await orbitConnection.get('stringBlob').then(({ data }) => data);
     * let jsonBlobData: {x: number} = await orbitConnection.get('jsonBlob').then(({ data }) => data);
     * ```
     *
     * If the object has any other MIME type then a Blob will be returned:
     * ```ts
     * let blob = new Blob([new ArrayBuffer(8)], {type: 'image/gif'});
     * await orbitConnection.put('gif', blob);
     * let gifData: Blob = await orbitConnection.get('gif').then(({ data }) => data);
     * ```
     *
     * Alternatively you can retrieve any object as a
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream | ReadableStream},
     * by supplying request parameters:
     * ```ts
     * let data = await orbitConnection.get('key', {streamBody: true}).then(
     *   ({ data }: { data?: ReadableStream }) => {
     *     // consume the stream
     *   }
     * );
     * ```
     *
     * @param key The key with which the object is indexed.
     * @param req Optional request parameters.
     * @returns A {@link Response} with the `data` property (see possible types in the documentation above).
     */
    OrbitConnection.prototype.get = function (key, req) {
        return __awaiter(this, void 0, void 0, function () {
            var request, streamBody, transformResponse;
            var _this = this;
            return __generator(this, function (_a) {
                request = req || {};
                streamBody = request.streamBody || false;
                transformResponse = function (response) { return __awaiter(_this, void 0, void 0, function () {
                    var ok, status, statusText, headers, type, data, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                ok = response.ok, status = response.status, statusText = response.statusText, headers = response.headers;
                                type = headers.get("content-type");
                                if (!!ok) return [3 /*break*/, 1];
                                _a = undefined;
                                return [3 /*break*/, 5];
                            case 1:
                                if (!streamBody) return [3 /*break*/, 2];
                                _b = response.body;
                                return [3 /*break*/, 4];
                            case 2: return [4 /*yield*/, // content type was not stored, let the caller decide how to handle the blob
                                (!type
                                    ? response.blob()
                                    : type.startsWith("text/")
                                        ? response.text()
                                        : type === "application/json"
                                            ? response.json()
                                            : response.blob())];
                            case 3:
                                _b = _c.sent();
                                _c.label = 4;
                            case 4:
                                _a = _b;
                                _c.label = 5;
                            case 5:
                                data = _a;
                                return [2 /*return*/, { ok: ok, status: status, statusText: statusText, headers: headers, data: data }];
                        }
                    });
                }); };
                return [2 /*return*/, this.kv.get(key).then(transformResponse)];
            });
        });
    };
    /** Delete an object from the connected orbit.
     *
     * @param key The key with which the object is indexed.
     * @param req Optional request parameters (unused).
     * @returns A {@link Response} without the `data` property.
     */
    OrbitConnection.prototype.delete = function (key, req) {
        return __awaiter(this, void 0, void 0, function () {
            var transformResponse;
            return __generator(this, function (_a) {
                transformResponse = function (response) {
                    var ok = response.ok, status = response.status, statusText = response.statusText, headers = response.headers;
                    return { ok: ok, status: status, statusText: statusText, headers: headers };
                };
                return [2 /*return*/, this.kv.del(key).then(transformResponse)];
            });
        });
    };
    /** List objects in the connected orbit.
     *
     * The list of keys is retrieved as a list of strings:
     * ```ts
     * let keys: string[] = await orbitConnection.list().then(({ data }) => data);
     * ```
     * Optionally, you can retrieve the list of objects as a
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream | ReadableStream},
     * by supplying request parameters:
     * ```ts
     * let data = await orbitConnection.list("", {streamBody: true}).then(
     *   ({ data }: { data?: ReadableStream }) => {
     *     // consume the stream
     *   }
     * );
     * ```
     *
     * @param prefix The prefix that the returned keys should have.
     * @param req Optional request parameters.
     * @returns A {@link Response} with the `data` property as a string[].
     */
    OrbitConnection.prototype.list = function (prefix, req) {
        if (prefix === void 0) { prefix = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var request, streamBody, transformResponse;
            var _this = this;
            return __generator(this, function (_a) {
                request = req || {};
                streamBody = request.streamBody || false;
                transformResponse = function (response) { return __awaiter(_this, void 0, void 0, function () {
                    var ok, status, statusText, headers, data, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                ok = response.ok, status = response.status, statusText = response.statusText, headers = response.headers;
                                if (!!ok) return [3 /*break*/, 1];
                                _a = undefined;
                                return [3 /*break*/, 5];
                            case 1:
                                if (!streamBody) return [3 /*break*/, 2];
                                _b = response.body;
                                return [3 /*break*/, 4];
                            case 2: return [4 /*yield*/, response.json()];
                            case 3:
                                _b = _c.sent();
                                _c.label = 4;
                            case 4:
                                _a = _b;
                                _c.label = 5;
                            case 5:
                                data = _a;
                                return [2 /*return*/, { ok: ok, status: status, statusText: statusText, headers: headers, data: data }];
                        }
                    });
                }); };
                return [2 /*return*/, this.kv.list(prefix).then(transformResponse)];
            });
        });
    };
    /** Retrieve metadata about an object from the connected orbit.
     *
     * @param key The key with which the object is indexed.
     * @param req Optional request parameters (unused).
     * @returns A {@link Response} without the `data` property.
     */
    OrbitConnection.prototype.head = function (key, req) {
        return __awaiter(this, void 0, void 0, function () {
            var transformResponse;
            return __generator(this, function (_a) {
                transformResponse = function (response) {
                    var ok = response.ok, status = response.status, statusText = response.statusText, headers = response.headers;
                    return { ok: ok, status: status, statusText: statusText, headers: headers };
                };
                return [2 /*return*/, this.kv.head(key).then(transformResponse)];
            });
        });
    };
    OrbitConnection.restore = function (keplerUri, serialisedConnection) {
        var authn = authenticator_1.Authenticator.deserialise(serialisedConnection);
        return new OrbitConnection(keplerUri, authn);
    };
    return OrbitConnection;
}());
exports.OrbitConnection = OrbitConnection;
var hostOrbit = function (wallet, keplerUrl, orbitId, domain) {
    if (domain === void 0) { domain = window.location.hostname; }
    return __awaiter(void 0, void 0, void 0, function () {
        var address, chainId, issuedAt, peerId, config, siwe, signature, hostHeaders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, wallet.getAddress()];
                case 1:
                    address = _a.sent();
                    return [4 /*yield*/, wallet.getChainId()];
                case 2:
                    chainId = _a.sent();
                    issuedAt = new Date(Date.now()).toISOString();
                    return [4 /*yield*/, fetch(keplerUrl + "/peer/generate").then(function (res) { return res.text(); })];
                case 3:
                    peerId = _a.sent();
                    config = {
                        address: address,
                        chainId: chainId,
                        domain: domain,
                        issuedAt: issuedAt,
                        orbitId: orbitId,
                        peerId: peerId,
                    };
                    return [4 /*yield*/, ssx_wasm_1.initialized];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, ssx_wasm_1.kepler.generateHostSIWEMessage(JSON.stringify(config))];
                case 5:
                    siwe = _a.sent();
                    return [4 /*yield*/, wallet.signMessage(siwe)];
                case 6:
                    signature = _a.sent();
                    return [4 /*yield*/, ssx_wasm_1.kepler.host(JSON.stringify({ siwe: siwe, signature: signature }))];
                case 7:
                    hostHeaders = _a.sent();
                    return [2 /*return*/, fetch(keplerUrl + "/delegate", {
                            method: "POST",
                            headers: JSON.parse(hostHeaders),
                        }).then(function (_a) {
                            var ok = _a.ok, status = _a.status, statusText = _a.statusText, headers = _a.headers;
                            return ({
                                ok: ok,
                                status: status,
                                statusText: statusText,
                                headers: headers,
                            });
                        })];
            }
        });
    });
};
exports.hostOrbit = hostOrbit;
