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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orbitParams = exports.getOrbitId = exports.makeCid = exports.Kepler = exports.Action = exports.S3 = exports.Ipfs = exports.startSIWESession = exports.siweAuthenticator = exports.tzStringAuthenticator = exports.didVmToParams = exports.startSession = exports.zcapAuthenticator = void 0;
var cross_fetch_1 = __importDefault(require("cross-fetch"));
var cids_1 = __importDefault(require("cids"));
var multihashing_async_1 = __importDefault(require("multihashing-async"));
var ipfs_1 = require("./ipfs");
Object.defineProperty(exports, "Ipfs", { enumerable: true, get: function () { return ipfs_1.Ipfs; } });
var s3_1 = require("./s3");
Object.defineProperty(exports, "S3", { enumerable: true, get: function () { return s3_1.S3; } });
var zcap_1 = require("./zcap");
Object.defineProperty(exports, "zcapAuthenticator", { enumerable: true, get: function () { return zcap_1.zcapAuthenticator; } });
Object.defineProperty(exports, "startSession", { enumerable: true, get: function () { return zcap_1.startSession; } });
Object.defineProperty(exports, "didVmToParams", { enumerable: true, get: function () { return zcap_1.didVmToParams; } });
var tzString_1 = require("./tzString");
Object.defineProperty(exports, "tzStringAuthenticator", { enumerable: true, get: function () { return tzString_1.tzStringAuthenticator; } });
var siwe_1 = require("./siwe");
Object.defineProperty(exports, "siweAuthenticator", { enumerable: true, get: function () { return siwe_1.siweAuthenticator; } });
Object.defineProperty(exports, "startSIWESession", { enumerable: true, get: function () { return siwe_1.startSIWESession; } });
var Action;
(function (Action) {
    Action["get"] = "GET";
    Action["put"] = "PUT";
    Action["delete"] = "DEL";
    Action["list"] = "LIST";
})(Action = exports.Action || (exports.Action = {}));
;
var Kepler = /** @class */ (function () {
    function Kepler(url, auth) {
        this.url = url;
        this.auth = auth;
    }
    Kepler.prototype.resolve = function (keplerUri, authenticate) {
        if (authenticate === void 0) { authenticate = true; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, versionedOrbit, cid, orbit;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!keplerUri.startsWith("kepler://"))
                            throw new Error("Invalid Kepler URI");
                        _a = keplerUri.split("/").slice(-2), versionedOrbit = _a[0], cid = _a[1];
                        orbit = versionedOrbit.split(":").pop();
                        if (!orbit || !cid)
                            throw new Error("Invalid Kepler URI");
                        return [4 /*yield*/, this.orbit(orbit).get(cid, authenticate)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    Kepler.prototype.s3 = function (orbit) {
        return new s3_1.S3(this.url, orbit, this.auth);
    };
    Kepler.prototype.orbit = function (orbit) {
        return new ipfs_1.Ipfs(this.url, orbit, this.auth);
    };
    Kepler.prototype.new_id = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cross_fetch_1.default(this.url + "/peer/generate").then(function (res) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, res.text()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Kepler.prototype.id_addr = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cross_fetch_1.default(this.url + "/peer/relay").then(function (res) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, res.text()];
                                case 1: return [2 /*return*/, (_a.sent()) + "/p2p-circuit/p2p/" + id];
                            }
                        }); }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Kepler.prototype.createOrbit = function (content, params, method) {
        if (params === void 0) { params = {}; }
        if (method === void 0) { method = 'did'; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, headers, oid, _b, _c, c, r, _d, _e;
            var _f;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _c = (_b = this.auth).createOrbit;
                        return [4 /*yield*/, Promise.all(content.map(function (c) { return __awaiter(_this, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _a = exports.makeCid;
                                        _b = Uint8Array.bind;
                                        return [4 /*yield*/, c.arrayBuffer()];
                                    case 1: return [4 /*yield*/, _a.apply(void 0, [new (_b.apply(Uint8Array, [void 0, _c.sent()]))()])];
                                    case 2: return [2 /*return*/, _c.sent()];
                                }
                            }); }); }))];
                    case 1: return [4 /*yield*/, _c.apply(_b, [_g.sent(), params, method])];
                    case 2:
                        _a = _g.sent(), headers = _a.headers, oid = _a.oid;
                        if (!(content.length === 1)) return [3 /*break*/, 4];
                        return [4 /*yield*/, cross_fetch_1.default(this.url + "/" + oid, {
                                method: 'POST',
                                body: content[0],
                                headers: headers
                            })];
                    case 3: return [2 /*return*/, _g.sent()];
                    case 4:
                        if (!(content.length === 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, cross_fetch_1.default(this.url + "/" + oid, {
                                method: 'POST',
                                headers: headers
                            })];
                    case 5: return [2 /*return*/, _g.sent()];
                    case 6:
                        c = content[0], r = content.slice(1);
                        _d = cross_fetch_1.default;
                        _e = [this.url + "/" + oid];
                        _f = {
                            method: 'POST'
                        };
                        return [4 /*yield*/, makeFormRequest.apply(void 0, __spreadArray([c], r))];
                    case 7: return [4 /*yield*/, _d.apply(void 0, _e.concat([(_f.body = _g.sent(),
                                _f.headers = headers,
                                _f)]))];
                    case 8: return [2 /*return*/, _g.sent()];
                }
            });
        });
    };
    return Kepler;
}());
exports.Kepler = Kepler;
var addContent = function (form, blob) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _b = (_a = form).append;
                _c = exports.makeCid;
                _d = Uint8Array.bind;
                return [4 /*yield*/, blob.arrayBuffer()];
            case 1: return [4 /*yield*/, _c.apply(void 0, [new (_d.apply(Uint8Array, [void 0, _e.sent()]))()])];
            case 2:
                _b.apply(_a, [_e.sent(),
                    blob]);
                return [2 /*return*/];
        }
    });
}); };
var makeCid = function (content) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _a = cids_1.default.bind;
            _b = [void 0, 1, 'raw'];
            return [4 /*yield*/, multihashing_async_1.default(content, 'blake2b-256')];
        case 1: return [2 /*return*/, new (_a.apply(cids_1.default, _b.concat([_c.sent()])))().toString('base58btc')];
    }
}); }); };
exports.makeCid = makeCid;
var getOrbitId = function (type_, params) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, typeof params === 'string'
                ? exports.makeCid(new TextEncoder().encode("" + type_ + params))
                : exports.getOrbitId(type_, exports.orbitParams(params))];
    });
}); };
exports.getOrbitId = getOrbitId;
var orbitParams = function (params) {
    var p = [];
    for (var _i = 0, _a = Object.entries(params); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        p.push(encodeURIComponent(key) + "=" + encodeURIComponent(value === 'string' ? value : value.toString()));
    }
    p.sort();
    return ';' + p.join(';');
};
exports.orbitParams = orbitParams;
var makeFormRequest = function (first) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var data, _a, rest_1, content;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    data = new FormData();
                    return [4 /*yield*/, addContent(data, first)];
                case 1:
                    _b.sent();
                    _a = 0, rest_1 = rest;
                    _b.label = 2;
                case 2:
                    if (!(_a < rest_1.length)) return [3 /*break*/, 5];
                    content = rest_1[_a];
                    return [4 /*yield*/, addContent(data, content)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _a++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, data];
            }
        });
    });
};
