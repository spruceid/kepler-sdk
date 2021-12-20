"use strict";
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
exports.Ipfs = void 0;
var index_1 = require("./index");
var cross_fetch_1 = __importDefault(require("cross-fetch"));
var Ipfs = /** @class */ (function () {
    function Ipfs(url, orbitId, auth) {
        this.url = url;
        this.orbitId = orbitId;
        this.auth = auth;
    }
    Object.defineProperty(Ipfs.prototype, "orbit", {
        get: function () {
            return this.orbitId;
        },
        enumerable: false,
        configurable: true
    });
    Ipfs.prototype.get = function (cid, authenticate) {
        if (authenticate === void 0) { authenticate = true; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = cross_fetch_1.default;
                        _b = [makeContentPath(this.url, this.orbit, cid)];
                        _e = {
                            method: "GET"
                        };
                        if (!authenticate) return [3 /*break*/, 2];
                        _d = [{}];
                        return [4 /*yield*/, this.auth.content(this.orbit, [cid], index_1.Action.get)];
                    case 1:
                        _c = __assign.apply(void 0, _d.concat([_f.sent()]));
                        return [3 /*break*/, 3];
                    case 2:
                        _c = undefined;
                        _f.label = 3;
                    case 3: return [4 /*yield*/, _a.apply(void 0, _b.concat([(_e.headers = _c,
                                _e)]))];
                    case 4: return [2 /*return*/, _f.sent()];
                }
            });
        });
    };
    Ipfs.prototype.put = function (first) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var auth, _a, _b, _c, _d, _e;
            var _f;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _b = (_a = this.auth).content;
                        _c = [this.orbit];
                        return [4 /*yield*/, Promise.all(__spreadArray([first], rest).map(function (c) { return __awaiter(_this, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _a = index_1.makeCid;
                                        _b = Uint8Array.bind;
                                        return [4 /*yield*/, c.arrayBuffer()];
                                    case 1: return [4 /*yield*/, _a.apply(void 0, [new (_b.apply(Uint8Array, [void 0, _c.sent()]))()])];
                                    case 2: return [2 /*return*/, _c.sent()];
                                }
                            }); }); }))];
                    case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_g.sent(), index_1.Action.put]))];
                    case 2:
                        auth = _g.sent();
                        if (!(rest.length >= 1)) return [3 /*break*/, 5];
                        _d = cross_fetch_1.default;
                        _e = [makeOrbitPath(this.url, this.orbit)];
                        _f = {
                            method: "PUT"
                        };
                        return [4 /*yield*/, makeFormRequest.apply(void 0, __spreadArray([first], rest))];
                    case 3: return [4 /*yield*/, _d.apply(void 0, _e.concat([(
                            // @ts-ignore
                            _f.body = _g.sent(),
                                _f.headers = auth,
                                _f)]))];
                    case 4: return [2 /*return*/, _g.sent()];
                    case 5: return [4 /*yield*/, cross_fetch_1.default(makeOrbitPath(this.url, this.orbit), {
                            method: "PUT",
                            body: first,
                            headers: __assign(__assign({}, auth), { "Content-Type": "application/json" })
                        })];
                    case 6: return [2 /*return*/, _g.sent()];
                }
            });
        });
    };
    Ipfs.prototype.del = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = cross_fetch_1.default;
                        _b = [makeContentPath(this.url, this.orbit, cid)];
                        _c = {
                            method: 'DELETE'
                        };
                        return [4 /*yield*/, this.auth.content(this.orbit, [cid], index_1.Action.delete)];
                    case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([(_c.headers = _d.sent(),
                                _c)]))];
                    case 2: return [2 /*return*/, _d.sent()];
                }
            });
        });
    };
    Ipfs.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = cross_fetch_1.default;
                        _b = [makeOrbitPath(this.url, this.orbit)];
                        _c = { method: 'GET' };
                        return [4 /*yield*/, this.auth.content(this.orbit, [], index_1.Action.list)];
                    case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([(_c.headers = _d.sent(), _c)]))];
                    case 2: return [2 /*return*/, _d.sent()];
                }
            });
        });
    };
    return Ipfs;
}());
exports.Ipfs = Ipfs;
var makeOrbitPath = function (url, orbit) { return url + "/" + orbit; };
var makeContentPath = function (url, orbit, cid) { return makeOrbitPath(url, orbit) + "/" + cid; };
